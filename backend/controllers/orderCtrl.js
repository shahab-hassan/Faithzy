const asyncHandler = require("express-async-handler");
const { productOrderModel, serviceOrderModel } = require("../models/orderModel");
const { createPaymentIntent } = require('../controllers/paymentCtrl');
const adminSettingsModel = require("../models/adminSettingsModel");
const productModel = require("../models/productModel");
const serviceModel = require("../models/serviceModel");
const sellerModel = require("../models/sellerModel");
const paymentModel = require("../models//paymentModel");
const cron = require('node-cron');

cron.schedule('* * * * *', asyncHandler(async () => {
  const now = new Date();
  const orders = await serviceOrderModel.find({ 'service.crrStatus': { $in: ['Active', 'Past Due'] } });

  for (const order of orders) {
    const dueDate = new Date(order.createdAt);
    dueDate.setDate(dueDate.getDate() + order.service.pkg.deliveryDays);

    if (now > dueDate) {
      if(order.service.status[order.service.status.length - 1].name !== "Past Due" && order.service.status[order.service.status.length - 1].name === "Active"){
        order.service.status.push({ name: 'Past Due', createdAt: now });
        order.service.crrStatus = 'Past Due';
        await order.save();
      }
    }
    else{
      if(order.service.status[order.service.status.length - 1].name === "Past Due"){
          order.service.status.pop();
          order.service.crrStatus = order.service.status[order.service.status.length - 1].name;
          await order.save();
      }
    }
  }
}));

exports.createProductOrder = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { items, summary, paymentMethod, billingInfo, paypalOrderId } = req.body;

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


  for (let item of items) {
    if (!((item.product.stock - item.count) >= 0)) {
      res.status(400);
      throw new Error("Not enough stock avaiable!")
    }
  }


  const products = items;

  const settings = await adminSettingsModel.findOne();
  const feesObj = settings.fees;

  let allProducts = [];

  for (let product of products) {

    let fee = 0;
    if (product.product.sellerId?.sellerType === "Free")
      fee = feesObj.seller.product;
    else
      fee = feesObj.paidSeller.product;

    const salesPrice = product.product.salesPrice * product.count;
    const shippingFees = product.product.shippingFees;
    const subtotal = salesPrice + shippingFees;
    const tax = subtotal * (Number(fee) / 100);
    const total = subtotal - tax;
    const promoDiscount = Number(summary.paidByBuyer.promoDiscount) / 100;

    const buyerSalesPrice = salesPrice * (1 - promoDiscount);
    const buyerSubtotal = buyerSalesPrice + shippingFees;
    const buyerTax = buyerSubtotal * (Number(feesObj.buyer.product) / 100);
    const buyerTotal = buyerSubtotal + buyerTax;

    const crrProduct = await productModel.findById(product.product._id);
    crrProduct.stock -= product.count;
    await crrProduct.save();

    allProducts.push({
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
      },
      netProfit: buyerTotal - total
    })
  }

  let paymentIntent;
  if (paymentMethod === 'stripe') {
    const amount = summary.paidByBuyer.total * 100;
    paymentIntent = await createPaymentIntent(amount);
  }

  const newOrder = new productOrderModel({
    userId,
    products: allProducts,
    summary,
    paymentMethod,
    billingInfo,
    clientSecret: paymentMethod === 'stripe' ? paymentIntent.client_secret : undefined,
    paypalOrderId: paymentMethod === 'paypal' ? paypalOrderId : undefined,
  });

  await newOrder.save();


  // if (products.some(product => product.product)) {
  //   await cartModel.findOneAndUpdate({ userId }, { products: [] });
  // }

  res.status(201).json({ success: true, order: newOrder, clientSecret: paymentIntent.client_secret });
});

// exports.createProductOrder = asyncHandler(async (req, res) => {

//   const userId = req.user._id;
//   const { items, summary, paymentMethod, billingInfo, paypalOrderId } = req.body;

//   if (req.user.sellerId?.toString() !== undefined) {
//     for (let item of items) {
//       if ((item.product.sellerId?._id === req.user.sellerId?.toString()) || (item.product.sellerId === req.user.sellerId?.toString())) {
//         res.status(400);
//         throw new Error("You cannot place Order!")
//       }
//     }
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   for (let key in billingInfo) {
//     if (!billingInfo[key] && key !== "note") {
//       res.status(400);
//       throw new Error("All fields are required!")
//     }
//     if (key === "email" && !emailRegex.test(billingInfo[key])) {
//       res.status(400);
//       throw new Error("Invalid email address!");
//     }
//   }

//   const products = items;

//   const settings = await adminSettingsModel.findOne();
//   const feesObj = settings.fees;

//   let allProducts = products.map(product => {

//     let fee = 0;
//     if (product.product.sellerId?.sellerType === "Free")
//       fee = feesObj.seller.product;
//     else
//       fee = feesObj.paidSeller.product;

//     // const salesPrice = products.length > 1 ? product.product.salesPrice * product.count : product.product.salesPrice;
//     const salesPrice = product.product.salesPrice * product.count;
//     const shippingFees = product.product.shippingFees;
//     const subtotal = salesPrice + shippingFees;
//     const tax = subtotal * (Number(fee) / 100);
//     const total = subtotal - tax;
//     const promoDiscount = Number(summary.paidByBuyer.promoDiscount) / 100;

//     const buyerSalesPrice = salesPrice * (1 - promoDiscount);
//     const buyerSubtotal = buyerSalesPrice + shippingFees;
//     const buyerTax = buyerSubtotal * (Number(feesObj.buyer.product) / 100);
//     const buyerTotal = buyerSubtotal + buyerTax;

//     return {
//       sellerId: product.product.sellerId?._id || product.product.sellerId,
//       productId: product.product._id,
//       count: product.count,
//       sellerToGet: {
//         salesPrice: salesPrice,
//         shippingFees: shippingFees,
//         subtotal: subtotal,
//         tax: tax,
//         total: total
//       },
//       buyerPaid: {
//         salesPrice: buyerSalesPrice,
//         shippingFees: shippingFees,
//         subtotal: buyerSubtotal,
//         tax: buyerTax,
//         total: buyerTotal
//       },
//       netProfit: buyerTotal - total
//     }
//   })

//   let paymentIntent;
//   if (paymentMethod === 'stripe') {
//     const amount = summary.paidByBuyer.total * 100;
//     paymentIntent = await createPaymentIntent(amount);
//   }

//   const newOrder = new productOrderModel({
//     userId,
//     products: allProducts,
//     summary,
//     paymentMethod,
//     billingInfo,
//     clientSecret: paymentMethod === 'stripe' ? paymentIntent.client_secret : undefined,
//     paypalOrderId: paymentMethod === 'paypal' ? paypalOrderId : undefined,
//   });

//   await newOrder.save();


//   // if (products.some(product => product.product)) {
//   //   await cartModel.findOneAndUpdate({ userId }, { products: [] });
//   // }

//   res.status(201).json({ success: true, order: newOrder, clientSecret: paymentIntent.client_secret });
// });

exports.createServiceOrder = asyncHandler(async (req, res) => {

  const userId = req.user._id;
  const { items, summary, paymentMethod, billingInfo, paypalOrderId } = req.body;

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

  let paymentIntent;
  if (paymentMethod === 'stripe') {
    const amount = summary.paidByBuyer.total * 100;
    paymentIntent = await createPaymentIntent(amount);
  }

  const newOrder = new serviceOrderModel({
    userId,
    service: serviceOrder,
    summary,
    paymentMethod,
    netProfit: summary.paidByBuyer.total - summary.sellerToGet.total,
    buyerInfo,
    clientSecret: paymentMethod === 'stripe' ? paymentIntent.client_secret : undefined,
    paypalOrderId: paymentMethod === 'paypal' ? paypalOrderId : undefined,
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
  const { ordersType = 'Products', pre } = req.query;
  let orders = [];
  const queryLimit = pre ? 10 : undefined;

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
      .sort({ updatedAt: -1 })
      .limit(queryLimit);

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
      .sort({ updatedAt: -1 })
      .limit(queryLimit);
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
    subOrder.crrStatus = newStatus;


    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.respondToProductOrderDelivery = asyncHandler(async (req, res) => {
  const { orderId, productId, response } = req.body;
  const order = await productOrderModel.findById(orderId);
  if (!order) return res.status(404).json({ success: false, error: "Order not found" });

  const subOrder = order.products.id(productId);
  if (!subOrder) return res.status(404).json({ success: false, error: "Product not found in order" });

  if (response === "yes") {

    try {
      const newPayment = new paymentModel({
        buyerId: order.userId,
        sellerId: subOrder.sellerId,
        to: "Seller",
        amount: subOrder.sellerToGet.total,
        itemType: "Product",
      });
      await newPayment.save();
    }
    catch (e) {
      res.status(400);
      throw new Error(e);
    }

    subOrder.status.push({ name: 'Completed', createdAt: new Date() });
    subOrder.crrStatus = "Completed";

    const crrProduct = await productModel.findById(subOrder.productId);
    const crrSeller = await sellerModel.findById(subOrder.sellerId);
    crrProduct.sold += subOrder.count;
    crrSeller.productsSold += subOrder.count;
    await crrProduct.save();
    await crrSeller.save();

  }
  else if (response === "no") {
    subOrder.status.push({ name: "Delivery Rejected (Buyer hasn't received Item yet)", createdAt: new Date() });
    subOrder.status.push({ name: 'Shipped', createdAt: new Date() });
    subOrder.crrStatus = "Shipped"
  }

  await order.save();

  return res.status(200).json({ success: true, order });

})

exports.cancelProductOrder = async (req, res) => {
  try {
    const { orderId, productId, cancellationReason, cancellationFrom } = req.body;
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

    subOrder.status.push({ name: 'On Hold', createdAt: new Date() });
    subOrder.crrStatus = 'On Hold';
    subOrder.cancellationReason = cancellationReason;
    subOrder.cancellationFrom = cancellationFrom;

    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.responseToProductOrderCancellation = asyncHandler(async (req, res) => {
  const { orderId, productId, response } = req.body;
  const order = await productOrderModel.findById(orderId);
  if (!order) return res.status(404).json({ success: false, error: "Order not found" });

  const subOrder = order.products.id(productId);
  if (!subOrder) return res.status(404).json({ success: false, error: "Product not found in order" });

  if (response === "yes") {

    try {
      const newPayment = new paymentModel({
        buyerId: order.userId,
        sellerId: subOrder.sellerId,
        to: "Buyer",
        amount: subOrder.buyerPaid.total,
        itemType: "Product",
      });
      await newPayment.save();
    }
    catch (e) {
      res.status(400);
      throw new Error(e);
    }

    subOrder.status.push({ name: 'Cancelled', createdAt: new Date() });
    subOrder.crrStatus = "Cancelled";

    const crrProduct = await productModel.findById(subOrder.productId);
    crrProduct.stock += subOrder.count;
    await crrProduct.save();

  }
  else if (response === "no") {
    const previousStatus = subOrder.status[subOrder.status.length - 2].name;
    subOrder.crrStatus = previousStatus
    subOrder.status.push({ name: "Cancellation Request Rejected!", createdAt: new Date() });
    subOrder.status.push({ name: previousStatus, createdAt: new Date() });
  }

  await order.save();

  return res.status(200).json({ success: true, order });

})

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
    order.service.crrStatus = 'Delivered';

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

      try {
        const newPayment = new paymentModel({
          buyerId: order.userId,
          sellerId: order.service.sellerId,
          to: "Seller",
          amount: order.summary.sellerToGet.total,
          itemType: "Service",
        });
        await newPayment.save();
      }
      catch (e) {
        res.status(400);
        throw new Error(e);
      }

      order.service.status.push({ name: "Completed", createdAt: Date.now() });
      order.service.crrStatus = 'Completed';
      order.service.history.unshift({
        name: 'deliveryAccepted',
        message: `accepted delivery. The order has been completed!`,
        role: 'Buyer',
        isDone: true,
        createdAt: new Date()
      });

      const crrService = await serviceModel.findById(order.service.serviceId);
      const crrSeller = await sellerModel.findById(order.service.sellerId);
      crrService.sold += 1;
      crrSeller.servicesDone += 1;
      await crrService.save();
      await crrSeller.save();

    }
    else if (response === 'decline') {
      order.service.status.push({ name: "Active", createdAt: Date.now() });
      order.service.crrStatus = "Active"
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

      try {
        const newPayment = new paymentModel({
          buyerId: order.userId,
          sellerId: order.service.sellerId,
          to: "Buyer",
          amount: order.summary.paidByBuyer.total,
          itemType: "Service",
        });
        await newPayment.save();
      }
      catch (e) {
        res.status(400);
        throw new Error(e);
      }

      order.service.status.push({ name: "Cancelled", createdAt: Date.now() });
      order.service.crrStatus = "Cancelled"
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