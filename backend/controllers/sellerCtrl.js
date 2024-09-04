const asyncHandler = require("express-async-handler");
const sellerModel = require('../models/sellerModel');
const userModel = require('../models/userModel');
const adminSettingsModel = require('../models/adminSettingsModel');
const { createPaymentIntent } = require("./paymentCtrl");

exports.createSeller = asyncHandler(async (req, res) => {
  if (req.user.role === "seller") {
    res.status(400);
    throw new Error("You are already a seller!");
  }

  try {
    let { firstName, lastName, companyName, displayName, country, description, selling, languages } = req.body;
    if (!selling) selling = "both";

    const fullName = `${firstName} ${lastName}`;

    const newSeller = new sellerModel({
      userId: req.user._id,
      profileImage: req.file.path,
      fullName,
      companyName,
      displayName,
      country,
      description,
      selling,
      languages: languages.split(',').map(lang => lang.trim())
    });

    await newSeller.save();

    await userModel.findByIdAndUpdate(req.user._id, { role: 'seller', sellerId: newSeller._id });

    await adminSettingsModel.findOneAndUpdate(
      {},
      { $inc: { totalSellers: 1 } },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, message: 'Seller profile created successfully!' });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

exports.getAllSellers = asyncHandler(async (req, res) => {
  try {
    const { filterType } = req.query;
    let sellerQuery = {};
    let userQuery = {};

    if (filterType === 'Paid') sellerQuery.sellerType = 'Paid';
    else if (filterType === 'Free') sellerQuery.sellerType = 'Free';

    if (filterType === 'Active') userQuery.userStatus = 'Active';
    else if (filterType === 'Blocked') userQuery.userStatus = 'Blocked';

    const users = await userModel.find(userQuery).select('_id');

    const userIds = users.map(user => user._id);

    if (userIds.length > 0) {
      sellerQuery.userId = { $in: userIds };
    } else {
      return res.status(200).json({ success: true, allSellers: [] });
    }

    const allSellers = await sellerModel.find(sellerQuery).populate('userId', '-password');

    res.status(200).json({ success: true, allSellers });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

exports.getSeller = asyncHandler(async (req, res) => {
  try {
    const seller = await sellerModel.findById(req.params.id).populate('userId', '-password');
    if (!seller) {
      res.status(404);
      throw new Error('Seller not found');
    }
    res.status(200).json({ success: true, seller });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

exports.updateSeller = asyncHandler(async (req, res) => {
  try {
    const seller = await sellerModel.findById(req.params.id);
    if (!seller) {
      res.status(404);
      throw new Error('Seller not found');
    }

    if (seller.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You are not authorized to update this seller profile');
    }

    const { firstName, lastName, companyName, displayName, country, description, selling, languages } = req.body;
    const fullName = `${firstName} ${lastName}`;

    seller.profileImage = req.file ? req.file.path : seller.profileImage;
    seller.fullName = fullName || seller.fullName;
    seller.companyName = companyName || seller.companyName;
    seller.displayName = displayName || seller.displayName;
    seller.country = country || seller.country;
    seller.description = description || seller.description;
    seller.selling = selling || seller.selling;
    seller.languages = languages ? languages.split(',').map(lang => lang.trim()) : seller.languages;

    await seller.save();
    res.status(200).json({ success: true, message: 'Seller profile updated successfully!' });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

exports.deleteSeller = asyncHandler(async (req, res) => {
  try {
    const seller = await sellerModel.findById(req.params.id);
    if (!seller) {
      res.status(404);
      throw new Error('Seller not found');
    }

    if (seller.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You are not authorized to delete this seller profile');
    }

    await seller.remove();

    await adminSettingsModel.findOneAndUpdate(
      {},
      { $inc: { totalSellers: -1 } }
  );

    res.status(200).json({ success: true, message: 'Seller profile deleted successfully!' });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});



exports.upgradeSellerPlan = asyncHandler(async (req, res) => {

  const { months, price, startDate, endDate, paymentMethod } = req.body.plan;

  let paymentIntent;
  if (paymentMethod === 'stripe') {
    const amount = price * 100;
    paymentIntent = await createPaymentIntent(amount);
  }

  const plan = {
    months,
    price,
    startDate,
    endDate,
    paymentMethod,
    clientSecret: paymentMethod === 'stripe' ? paymentIntent.client_secret : undefined,
    paypalOrderId: paymentMethod === 'paypal' ? paypalOrderId : undefined,
  }

  const seller = await sellerModel.findById(req.params.id);
  if(!seller){
    res.status(404);
    throw new Error("Seller not found!");
  }

  seller.plan = plan;
  seller.sellerType = "Paid";
  seller.investment.push({in: "membership", of: price, on: new Date()});

  seller.save();

  res.status(200).json({ success: true, seller, clientSecret: paymentIntent.client_secret });
});



exports.cancelSellerPlan = asyncHandler(async (req, res) => {
  const seller = await sellerModel.findByIdAndUpdate(req.params.id, { plan: null, sellerType: "Free" }, { new: true });
  res.status(200).json({ success: true, seller });
});





// exports.getSellerByUserId = asyncHandler(async (req, res) => {
//   try {
//     const seller = await sellerModel.findOne({ userId: req.params.userId });
//     if (!seller) {
//       res.status(404);
//       throw new Error('Seller not found');
//     }
//     res.status(200).json({success:true, seller});
//   } catch (error) {
//     res.status(400);
//     throw new Error(error);
//   }
// });