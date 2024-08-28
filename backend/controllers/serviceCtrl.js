const asyncHandler = require("express-async-handler");

const serviceModel = require("../models/serviceModel");
const recentlyViewedModel = require("../models/recentlyViewedModel")
const categoryModel = require('../models/categoryModel');
const adminSettingsModel = require('../models/adminSettingsModel');

exports.getAllServices = asyncHandler(async (req, res) => {
  const allServices = await serviceModel.find({});
  res.status(200).json({
    success: true,
    allServices
  })
})

exports.getMySellerServices = asyncHandler(async (req, res) => {
  try {
    const allServices = await serviceModel.find({ sellerId: req.user.sellerId })

    res.status(200).json({
      success: true,
      allServices
    });
  } catch (e) {
    res.status(400);
    throw new Error(e);
  }
});

exports.getSellerServicesById = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.isAdminLogin ? 4 : 5;

    const allServices = await serviceModel.find({ sellerId: req.params.id })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalSellerServices = await serviceModel.countDocuments({ sellerId: req.params.id });
    const totalPages = Math.ceil(totalSellerServices / limit);

    res.status(200).json({
      success: true,
      allServices,
      totalPages,
    });
  } catch (e) {
    res.status(400);
    throw new Error(e.message);
  }
});


exports.getService = asyncHandler(async (req, res) => {

  const service = await serviceModel.findById(req.params.id).populate({
    path: 'sellerId',
    populate: {
      path: 'userId',
      select: 'username',
    }
  });

  if (!service) {
    res.status(404)
    throw new Error("Posting not found!")
  }

  res.status(200).json({
    success: true,
    service
  })
})

exports.createService = asyncHandler(async (req, res) => {

  try {
    let { title, description, category, tags, questions, packages, discountPercent, discountDays
    } = req.body;

    const serviceImages = req.files ? req.files.map(file => file.path) : [];

    let status = ["new", "freeSeller"]
    if (Number(discountPercent) !== 0)
      status.push("discounted");

    const service = new serviceModel({
      sellerId: req.user.sellerId._id,
      serviceImages,
      title,
      description,
      category,
      discountPercent,
      discountDays,
      tags,
      status,
      questions: JSON.parse(questions),
      packages: JSON.parse(packages)
    });

    await categoryModel.findOneAndUpdate(
      { name: category },
      { $inc: { count: 1 } }
    );

    const newService = await service.save();

    await adminSettingsModel.findOneAndUpdate(
      {},
      { $inc: { activeServices: 1 } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Post Created",
      service: newService
    })

  } catch (e) {
    res.status(400)
    throw new Error(e)
  }

})

exports.updateService = asyncHandler(async (req, res) => {
  let service = await serviceModel.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Posting not found!");
  }

  if (service.sellerId.toString() !== req.user.sellerId._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to update this posting');
  }

  try {
    let { title, description, category, tags, questions, packages, discountPercent, discountDays
    } = req.body;

    const serviceImages = req.files.length > 0 ? req.files.map(file => file.path) : service.serviceImages;

    let status = service.status;

    if (Number(discountPercent) !== 0 && !status.includes("discounted")) status.push("discounted");

    let index = status.indexOf("discounted");
    if ((Number(discountPercent) === 0) && index > -1) status.splice(index, 1);

    const updatedService = await serviceModel.findByIdAndUpdate(
      req.params.id,
      {
        userId: req.user._id,
        serviceImages,
        title,
        description,
        category,
        discountPercent,
        discountDays,
        tags,
        status,
        questions: JSON.parse(questions),
        packages: JSON.parse(packages)
      },
      { new: true }
    );

    if (service.category !== category) {

      await categoryModel.findOneAndUpdate(
        { name: service.category },
        { $inc: { count: -1 } }
      );

      await categoryModel.findOneAndUpdate(
        { name: category },
        { $inc: { count: 1 } }
      );

    }


    res.status(200).json({
      success: true,
      message: "Post Updated",
      updatedService
    });
  } catch (e) {
    res.status(400);
    throw new Error(e);
  }
});

exports.deleteService = asyncHandler(async (req, res) => {

  let service = await serviceModel.findById(req.params.id);

  if (!service) {
    res.status(404)
    throw new Error("Posting not found!")
  }

  if (service.sellerId.toString() !== req.user.sellerId._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to update this posting');
  }

  await categoryModel.findOneAndUpdate(
    { name: service.category },
    { $inc: { count: -1 } }
  );

  await serviceModel.findByIdAndDelete(service._id);

  await adminSettingsModel.findOneAndUpdate(
    {},
    { $inc: { activeServices: -1 } }
  );

  res.status(200).json({
    success: true,
    message: "Post Deleted successfully"
  })
})

exports.getRecentlyViewedServices = asyncHandler(async (req, res) => {

  let recentlyViewed = [];

  if (req.user)
    recentlyViewed = await recentlyViewedModel.findOne({ userId: req.user._id }).populate('viewedServices');

  res.status(200).json({
    success: true,
    recentlyViewed
  });
})

exports.addRecentlyViewedService = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { serviceId } = req.body;
  let recentlyViewed = await recentlyViewedModel.findOne({ userId });

  if (!recentlyViewed) {
    recentlyViewed = new recentlyViewedModel({ userId, viewedServices: [] });
  }

  recentlyViewed.viewedServices = recentlyViewed.viewedServices.filter(
    (id) => id.toString() !== serviceId.toString()
  );

  recentlyViewed.viewedServices.unshift(serviceId);

  if (recentlyViewed.viewedServices.length > 10) {
    recentlyViewed.viewedServices.pop();
  }

  await recentlyViewed.save();

  res.status(200).json({ success: true, recentlyViewed });
});

exports.getCategoryServices = asyncHandler(async (req, res) => {
  const { categoryName } = req.params;
  const { minPrice, maxPrice, rating, page = 1, limit = 40 } = req.query;

  let filter = { category: categoryName };
  if (minPrice !== undefined) filter['packages.salesPrice'] = { $gte: Number(minPrice) };
  if (maxPrice !== undefined) filter['packages.salesPrice'] = { ...filter['packages.salesPrice'], $lte: Number(maxPrice) };
  if (rating !== undefined && Number(rating) > 0) filter.rating = { $gte: Number(rating) };
  else if (rating !== undefined && Number(rating) === 0) filter.rating = { $lte: Number(rating) };

  const services = await serviceModel.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalServices = await serviceModel.countDocuments(filter);

  res.status(200).json({
    success: true,
    services,
    totalServices,
    totalPages: Math.ceil(totalServices / limit),
  });
});
