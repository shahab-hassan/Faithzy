const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");


exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, categories });
});

exports.getAllCategories = asyncHandler(async (req, res) => {
    const productCategories = await Category.find({ type: "product" });
    const serviceCategories = await Category.find({ type: "service" });
    res.status(200).json({ success: true, productCategories, serviceCategories });
});


exports.getAllProductCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ type: "product" });
    res.status(200).json({ success: true, categories });
});


exports.getAllServiceCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ type: "service" });
    res.status(200).json({ success: true, categories });
});


exports.getProductCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category || category.type !== "product") {
        res.status(404);
        throw new Error("Product category not found");
    }

    res.status(200).json({ success: true, category });
});


exports.getServiceCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category || category.type !== "service") {
        res.status(404);
        throw new Error("Service category not found");
    }

    res.status(200).json({ success: true, category });
});


exports.addCategory = asyncHandler(async (req, res) => {
    const { name, type } = req.body;
    const categoryExists = await Category.findOne({ name, type });

    if (categoryExists) {
        res.status(400);
        throw new Error("Category already exists");
    }

    const category = new Category({ name, type });
    await category.save();
    res.status(201).json({ success: true, message: "Category Added", category });
});


exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, type } = req.body;

    const category = await Category.findById(id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    category.name = name;
    category.type = type;
    await category.save();

    res.status(200).json({ success: true, message: "Category Updated", category });
});


exports.deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    await Category.deleteOne({ _id: id });

    res.status(200).json({ success: true, message: "Category removed" });
});