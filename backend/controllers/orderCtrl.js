const asyncHandler = require("express-async-handler");
const { productOrderModel, serviceOrderModel } = require("../models/orderModel");
const { createPaymentIntent } = require('../controllers/paymentCtrl');
const adminSettingsModel = require("../models/adminSettingsModel");

exports.createProductOrder = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { items, summary, paymentMethod, billingInfo } = req.body;

  if (req.user.sellerId?.toString() !== undefined) {
    for (let item of items) {
      if ((item.product.sellerId?._id === req.user.sellerId?.toString()) || (item.product.sellerId === req.user.sellerId?.toString())) {
        res.status(400);
        throw new Error("You cannot place Order!")
      }
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let key in billingInfo) {
    if (!billingInfo[key] && key !== "note") {
      res.status(400);
      throw new Error("All fields are required!")
    }
    if (key === "email" && !emailRegex.test(billingInfo[key])) {
      res.status(400);
      throw new Error("Invalid email address!");
    }
  }

  const products = items;

  const settings = await adminSettingsModel.findOne();
  const feesObj = settings.fees;

  let allProducts = products.map(product => {

    let fee = 0;
    if (product.product.sellerId?.sellerType === "Free")
      fee = feesObj.seller.product;
    else
      fee = feesObj.paidSeller.product;

    const salesPrice = products.length > 1 ? product.product.salesPrice * product.count : product.product.salesPrice;
    const shippingFees = product.product.shippingFees;
    const subtotal = salesPrice + shippingFees;
    const tax = subtotal * (Number(fee) / 100);
    const total = subtotal - tax;
    const promoDiscount = Number(summary.paidByBuyer.promoDiscount) / 100;

    const buyerSalesPrice = salesPrice * (1 - promoDiscount);
    const buyerSubtotal = buyerSalesPrice + shippingFees;
    const buyerTax = buyerSubtotal * (Number(feesObj.buyer.product) / 100);
    const buyerTotal = buyerSubtotal + buyerTax;

    return {
      sellerId: product.product.sellerId?._id || product.product.sellerId,
      productId: product.product._id,
      count: product.count,
      sellerToGet: {
        salesPrice: salesPrice,
        shippingFees: shippingFees,
        subtotal: subtotal,
        tax: tax,
        total: total
      },
      buyerPaid: {
        salesPrice: buyerSalesPrice,
        shippingFees: shippingFees,
        subtotal: buyerSubtotal,
        tax: buyerTax,
        total: buyerTotal
      }
    }
  })

  const amount = summary.paidByBuyer.total * 100;
  const paymentIntent = await createPaymentIntent(amount);

  const newOrder = new productOrderModel({
    userId,
    products: allProducts,
    summary,
    paymentMethod,
    billingInfo,
    clientSecret: paymentIntent.client_secret,
  });

  await newOrder.save();


  // if (products.some(product => product.product)) {
  //   await cartModel.findOneAndUpdate({ userId }, { products: [] });
  // }

  res.status(201).json({ success: true, order: newOrder, clientSecret: paymentIntent.client_secret });
});

exports.createServiceOrder = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { items, summary, paymentMethod, billingInfo } = req.body;

  const serviceItem = items;
  const { firstName, lastName, country, city, email, phoneNumber } = billingInfo;
  const buyerInfo = { firstName, lastName, country, city, email, phoneNumber };

  if (req.user.sellerId?.toString() !== undefined) {
    if ((serviceItem.service.sellerId?._id === req.user.sellerId?.toString()) || (serviceItem.service.sellerId === req.user.sellerId?.toString())) {
      res.status(400);
      throw new Error("You cannot place Order!")
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let key in buyerInfo) {
    if (!buyerInfo[key]) {
      res.status(400);
      throw new Error("All fields are required!")
    }
    if (key === "email" && !emailRegex.test(buyerInfo[key])) {
      res.status(400);
      throw new Error("Invalid email address!");
    }
  }


  let serviceOrder = {
    sellerId: serviceItem.service.sellerId?._id || serviceItem.service.sellerId,
    serviceId: serviceItem.service._id,
    pkg: serviceItem.pkg ? serviceItem.pkg : serviceItem.service.packages[serviceItem.pkgIndex],
  }

  const amount = summary.paidByBuyer.total * 100;
  const paymentIntent = await createPaymentIntent(amount);

  const newOrder = new serviceOrderModel({
    userId,
    service: serviceOrder,
    summary,
    paymentMethod,
    buyerInfo,
    clientSecret: paymentIntent.client_secret,
  });


  newOrder.service.history.unshift({
    name: "orderPlaced",
    message: "placed the Order!",
    role: "Buyer",
    isDone: true,
    createdAt: new Date()
  });

  newOrder.service.history.unshift({
    name: "orderStarted",
    message: "The order has been started!",
    role: "Buyer",
    isDone: true,
    createdAt: new Date()
  });

  newOrder.service.history.unshift({
    name: "requirementsRequired",
    message: "has some questions for you to answer!",
    role: "Seller",
    isDone: false,
    createdAt: new Date()
  });

  await newOrder.save();


  // if (products.some(product => product.product)) {
  //   await cartModel.findOneAndUpdate({ userId }, { products: [] });
  // }

  res.status(201).json({ success: true, order: newOrder, clientSecret: paymentIntent.client_secret });
});

exports.getBuyerProductOrder = asyncHandler(async (req, res) => {

  const order = await productOrderModel.findById(req.params.id)
    .populate({
      path: 'products.productId',
      select: 'title category productImages',
      populate: {
        path: 'sellerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'username'
        }
      }
    });

  if (!order || order.userId.toString() !== req.user._id.toString()) {
    res.status(404)
    throw new Error("Order not found");
  } else {
    res.status(200).json({ success: true, order });
  }
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { ordersType = 'Products' } = req.query;
  let orders = [];

  if (ordersType === 'Products') {

    orders = await productOrderModel.find()
      .populate('userId', 'username email userStatus')
      .populate({
        path: 'products.sellerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'username'
        }
      })
      .populate('products.productId', 'title category')
      .sort({updatedAt: -1});

  } 
  
  else if (ordersType === 'Services') {

    orders = await serviceOrderModel.find()
      .populate('userId', 'username email userStatus')
      .populate({
        path: 'service.sellerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'username'
        }
      })
      .populate('service.serviceId', 'title category')
      .sort({updatedAt: -1});
  }

  res.json({
    success: true,
    orders,
  });
});

exports.getBuyerProductOrders = asyncHandler(async (req, res) => {
  const orders = await productOrderModel.find({ userId: req.user.id }).populate({
    path: 'products.productId',
    select: 'title category productImages',
    populate: {
      path: 'sellerId',
      select: 'userId',
      populate: {
        path: 'userId',
        select: 'username'
      }
    }
  });
  res.status(200).json({ success: true, orders: orders?.reverse() });
});

exports.getBuyerServiceOrder = asyncHandler(async (req, res) => {

  const order = await serviceOrderModel.findById(req.params.id)
    .populate({
      path: 'service.serviceId',
      select: 'title category serviceImages questions',
      populate: {
        path: 'sellerId',
        select: 'userId fullName',
        populate: {
          path: 'userId',
          select: 'username'
        }
      }
    });

  const usernames = [req.user.username, order.service.serviceId.sellerId.userId.username];

  if (!order || order.userId.toString() !== req.user._id.toString()) {
    res.status(404)
    throw new Error("Order not found");
  } else {
    res.status(200).json({ success: true, order, usernames });
  }
});

exports.getBuyerServiceOrders = asyncHandler(async (req, res) => {
  const orders = await serviceOrderModel.find({ userId: req.user.id }).populate({
    path: 'service.serviceId',
    select: 'title category serviceImages',
    populate: {
      path: 'sellerId',
      select: 'userId',
      populate: {
        path: 'userId',
        select: 'username'
      }
    }
  });
  res.status(200).json({ success: true, orders: orders?.reverse() });
});

exports.getSellerProductOrder = asyncHandler(async (req, res) => {

  const order = await productOrderModel.findById(req.params.id)
    .populate('userId', 'username')
    .populate('products.productId')

  if (!order || !order.products.some(p => p.sellerId.toString() === req.user.sellerId.toString())) {
    res.status(404)
    throw new Error("Order not found");
  } else {
    res.status(200).json({ success: true, order });
  }

});

exports.getSellerProductOrders = asyncHandler(async (req, res) => {
  const orders = await productOrderModel.find({ 'products.sellerId': req.user.sellerId })
    .populate('userId', 'username')
    .populate('products.productId', 'title category productImages');

  res.status(200).json({ success: true, orders: orders?.reverse() });
});

exports.getSellerServiceOrder = asyncHandler(async (req, res) => {

  const order = await serviceOrderModel.findById(req.params.id)
    .populate('userId', 'username')
    .populate('service.serviceId')

  const usernames = [order.userId.username, req.user.username];

  if (!order || order.service.sellerId.toString() !== req.user.sellerId.toString()) {
    res.status(404)
    throw new Error("Order not found");
  } else {
    res.status(200).json({ success: true, order, usernames });
  }

});

exports.getSellerServiceOrders = asyncHandler(async (req, res) => {
  const orders = await serviceOrderModel.find({ 'service.sellerId': req.user.sellerId })
    .populate('userId', 'username')
    .populate('service.serviceId', 'title category serviceImages');

  res.status(200).json({ success: true, orders: orders?.reverse() });
});

exports.updateProductOrderStatus = async (req, res) => {
  try {
    const { orderId, productId, newStatus } = req.body;
    const order = await productOrderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    const subOrder = order.products.id(productId);
    if (!subOrder) return res.status(404).json({ success: false, error: "Product not found in order" });

    const currentStatus = subOrder.status[subOrder.status.length - 1].name;

    if (currentStatus === 'Delivered') {
      return res.status(400).json({ success: false, error: "Cannot change status of a delivered order" });
    }

    const validStatusTransitions = {
      'Active': ['Shipped', 'Delivered'],
      'Shipped': ['Delivered']
    };

    if (!validStatusTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({ success: false, error: "Invalid status transition" });
    }

    if (newStatus === 'Delivered' && currentStatus === 'Active') {
      subOrder.status.push({ name: 'Shipped', createdAt: new Date() });
    }

    subOrder.status.push({ name: newStatus, createdAt: new Date() });
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.cancelProductOrder = async (req, res) => {
  try {
    const { orderId, productId, cancellationReason } = req.body;
    const order = await productOrderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    const subOrder = order.products.id(productId);
    if (!subOrder) return res.status(404).json({ success: false, error: "Product not found in order" });

    const currentStatus = subOrder.status[subOrder.status.length - 1].name;
    if (currentStatus === 'Delivered') {
      return res.status(400).json({ success: false, error: "Cannot cancel a delivered order" });
    }
    else if (currentStatus === "Cancelled") {
      return res.status(400).json({ success: false, error: "Order is already Cancelled" });
    }

    subOrder.status.push({ name: 'Cancelled', createdAt: new Date() });
    subOrder.cancellationReason = cancellationReason;
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.saveServiceOrderAnswers = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { answers } = req.body;

    const order = await serviceOrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.answers = answers;

    order.service.history.forEach((activity, index) => {
      if (activity.name === "requirementsRequired") {
        order.service.history[index] = {
          name: "requirementsSubmitted",
          message: "submitted Requirements",
          role: "Buyer",
          isDone: true,
          createdAt: new Date()
        };
      }
    })

    await order.save();

    res.status(200).json({ message: "Answers submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save answers" });
  }
};

exports.sendExtensionRequest = async (req, res) => {
  const { extensionDate, extensionReason } = req.body;

  if (!extensionDate || !extensionReason) {
    return res.status(400).json({ error: 'Extension date and reason are required' });
  }

  try {
    const order = await serviceOrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let newDeliveryDate = new Date(extensionDate);
    const originalDeadline = new Date(order.createdAt.getTime() + order.service.pkg.deliveryDays * 24 * 60 * 60 * 1000);

    if (newDeliveryDate <= originalDeadline) {
      return res.status(400).json({ error: 'Extension date must be after the original deadline' });
    }

    const extendedDays = Math.ceil((newDeliveryDate - originalDeadline) / (24 * 60 * 60 * 1000));

    const options = { month: 'short', day: 'numeric', year: '2-digit' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = new Date(newDeliveryDate).toLocaleDateString(undefined, options);
    const formattedTime = new Date(originalDeadline + (newDeliveryDate - originalDeadline)).toLocaleTimeString(undefined, timeOptions);
    newDeliveryDate = `${formattedTime} - ${formattedDate}`;

    order.service.history.unshift({
      name: 'extensionRequested',
      message: `sent ${(extendedDays < 10 && "0") + extendedDays} days extension request until: ${newDeliveryDate.toLocaleString()}`,
      description: { text: extensionReason, images: [], extensionDays: extendedDays },
      role: 'Seller',
      isDone: false,
      createdAt: new Date()
    });

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.respondToExtensionRequest = asyncHandler(async (req, res) => {
  const { response } = req.body;
  const { id, historyId } = req.params;

  try {
    const order = await serviceOrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const historyItem = order.service.history.id(historyId);
    if (!historyItem || historyItem.name !== 'extensionRequested' || historyItem.isDone) {
      return res.status(400).json({ error: 'Invalid extension request' });
    }

    const extensionDays = historyItem.description.extensionDays;
    if (response === 'accept') {
      const originalDays = order.service.pkg.deliveryDays;
      order.service.pkg.deliveryDays = extensionDays + originalDays;

      order.service.history.unshift({
        name: 'extensionAccepted',
        message: `accepted ${(extensionDays < 10 && "0") + extensionDays} days extension request`,
        role: 'Buyer',
        isDone: true,
        createdAt: new Date()
      });
    }
    else if (response === 'decline') {
      order.service.history.unshift({
        name: 'extensionDeclined',
        message: `declined ${(extensionDays < 10 && "0") + extensionDays} extension request`,
        role: 'Buyer',
        isDone: true,
        createdAt: new Date()
      });
    }

    historyItem.isDone = true;

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

exports.sendDelivery = async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is Required!' });
  }

  try {
    const order = await serviceOrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const images = req.files.map(file => file.path);

    order.service.history.unshift({
      name: 'deliverySent',
      message: `delivered the order!`,
      description: { text: description, images: images },
      role: 'Seller',
      isDone: false,
      createdAt: new Date()
    });
    order.service.status.push({ name: "Delivered", createdAt: Date.now() })

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.respondToDelivery = asyncHandler(async (req, res) => {
  const { response } = req.body;
  const { id, historyId } = req.params;

  try {
    const order = await serviceOrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const historyItem = order.service.history.id(historyId);
    if (!historyItem || historyItem.name !== 'deliverySent' || historyItem.isDone) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (response === 'accept') {
      order.service.status.push({ name: "Completed", createdAt: Date.now() });
      order.service.history.unshift({
        name: 'deliveryAccepted',
        message: `accepted delivery. The order has been completed!`,
        role: 'Buyer',
        isDone: true,
        createdAt: new Date()
      });
    }
    else if (response === 'decline') {
      order.service.status.push({ name: "Active", createdAt: Date.now() });
      order.service.history.unshift({
        name: 'askedForRevision',
        message: `asked for Revision!`,
        role: 'Buyer',
        isDone: true,
        createdAt: new Date()
      });
    }

    historyItem.isDone = true;

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

exports.sendCancellationRequest = async (req, res) => {
  const { cancellationReason } = req.body;

  if (!cancellationReason) {
    return res.status(400).json({ error: 'Cancellation Reason is Required!' });
  }

  try {
    const order = await serviceOrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.service.history.unshift({
      name: 'cancellationSent',
      message: `asked to cancel order!`,
      description: { text: cancellationReason },
      role: 'Seller',
      isDone: false,
      createdAt: new Date()
    });

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.respondToCancellation = asyncHandler(async (req, res) => {
  const { response } = req.body;
  const { id, historyId } = req.params;

  try {
    const order = await serviceOrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const historyItem = order.service.history.id(historyId);
    if (!historyItem || historyItem.name !== 'cancellationSent' || historyItem.isDone) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (response === 'accept') {
      order.service.status.push({ name: "Cancelled", createdAt: Date.now() });
      order.service.history.unshift({
        name: 'cancellationAccepted',
        message: `agreed to cancel. The order has been cancelled`,
        role: 'Buyer',
        isDone: true,
        createdAt: new Date()
      });
    }
    else if (response === 'decline') {
      order.service.history.unshift({
        name: 'cancellationDeclined',
        message: `rejected request to cancel order!`,
        role: 'Buyer',
        isDone: true,
        createdAt: new Date()
      });
    }

    historyItem.isDone = true;

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});