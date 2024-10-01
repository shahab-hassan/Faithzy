const asyncHandler = require("express-async-handler");

const productModel = require("../models/productModel");
const recentlyViewedModel = require("../models/recentlyViewedModel")
const categoryModel = require('../models/categoryModel');
const adminSettingsModel = require('../models/adminSettingsModel');

const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
    try {
        const productsToUpdate = await productModel.find({
            discountPercent: { $gt: 0 },
            discountExpiryDate: { $lt: new Date() }
        }).populate('sellerId');

        if (productsToUpdate.length > 0) {

            const adminSettings = await adminSettingsModel.findOne();
            const feesObj = adminSettings.fees;

            for (let product of productsToUpdate) {

                product.discountPercent = 0;
                product.discountExpiryDate = new Date();

                const discountedIndex = product.status.indexOf('discounted');
                if (discountedIndex > -1) {
                    product.status.splice(discountedIndex, 1);
                }

                product.salesPrice = product.price;
                const tax = product?.sellerId?.sellerType === "Paid" ? Number(feesObj.paidSeller.product) : Number(feesObj.seller.product);
                product.amountToGet = product.price - (product.price * (tax / 100));

                await product.save();
            }
        }

    } catch (error) {
        console.error('Error running cron job:', error);
    }
});

exports.getAllProducts = asyncHandler(async (req, res) => {
    const allProducts = await productModel.find({});
    res.status(200).json({
        success: true,
        allProducts
    })
})

exports.getAllProductsResults = async (req, res) => {
    try {
        const { search, minPrice, maxPrice, category, rating, page = 1 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } }
            ];
        }

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = minPrice;
            if (maxPrice) query.price.$lte = maxPrice;
        }
        if (rating) query.rating = { $gte: rating };

        const productsPerPage = 40;
        const products = await productModel.find(query)
            .sort(search ? { title: "asc" } : {})
            .limit(productsPerPage)
            .skip(productsPerPage * (page - 1));

        const totalProducts = await productModel.countDocuments(query);

        res.status(200).json({
            success: true,
            products,
            totalProducts,
            totalPages: Math.ceil(totalProducts / productsPerPage),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || "Server Error",
        });
    }
};

exports.getMySellerProducts = asyncHandler(async (req, res) => {
    let allProducts;
    try {
        allProducts = await productModel.find({ sellerId: req.user.sellerId });
    }
    catch (e) {
        res.status(400)
        throw new Error(e);
    }
    res.status(200).json({
        success: true,
        allProducts
    })
})

exports.getSellerProductsById = asyncHandler(async (req, res) => {
    let allProducts, totalPages;
    try {
        const { isTabletPro, isTablet, isMobilePro, isMobile } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = isMobile === "true" ? 1 : isMobilePro === "true" ? 2 : isTablet === "true" ? 3 : (isTabletPro === "true" || req.query.isAdminLogin === "true") ? 4 : 5;

        allProducts = await productModel.find({ sellerId: req.params.id })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalSellerProducts = await productModel.countDocuments({ sellerId: req.params.id });
        totalPages = Math.ceil(totalSellerProducts / limit);

    }
    catch (e) {
        res.status(400)
        throw new Error(e);
    }
    res.status(200).json({
        success: true,
        allProducts,
        totalPages
    })
})

exports.getProduct = asyncHandler(async (req, res) => {

    const product = await productModel.findById(req.params.id).populate({
        path: 'sellerId',
        populate: {
            path: 'userId',
            select: 'username',
        }
    });

    if (!product) {
        res.status(404)
        throw new Error("Product not found!")
    }

    res.status(200).json({
        success: true,
        product
    })
})

exports.createProduct = asyncHandler(async (req, res) => {

    try {
        let { title, description, category, stock, price, discountPercent,
            discountExpiryDate, salesPrice, amountToGet, shippingFees, tags
        } = req.body;

        const productImages = req.files ? [req.files.productThumbnail[0].path, ...req.files.productGallery.map(file => file.path)] : [];

        let status = ["new", "freeSeller"]
        if (Number(discountPercent) !== 0)
            status.push("discounted");

        const product = new productModel({
            sellerId: req.user.sellerId._id,
            productImages,
            title,
            description,
            category,
            stock,
            price,
            discountPercent,
            discountExpiryDate: Number(discountPercent) !== 0 ? discountExpiryDate : new Date(),
            salesPrice,
            amountToGet,
            shippingFees,
            tags,
            status
        });

        await categoryModel.findOneAndUpdate(
            { name: category },
            { $inc: { count: 1 } }
        );

        const newProduct = await product.save();

        res.status(200).json({
            success: true,
            message: "Product Created",
            product: newProduct
        })

    } catch (e) {
        res.status(400)
        throw new Error(e)
    }

})

exports.updateProduct = asyncHandler(async (req, res) => {
    let product = await productModel.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found!");
    }

    if (product.sellerId.toString() !== req.user.sellerId._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to update this product');
    }

    try {
        let { title, description, category, stock, price, discountPercent, discountExpiryDate, salesPrice, amountToGet, shippingFees, tags } = req.body;

        let updatedImages = product.productImages;

        if (req.files) {
            if (req.files.productThumbnail)
                updatedImages.splice(0, 1, req.files.productThumbnail[0].path);
            if (req.files.productGallery)
                updatedImages = [updatedImages[0], ...req.files.productGallery.map(file => file.path)];
        }

        let status = product.status;

        if (Number(discountPercent) !== 0 && !status.includes("discounted")) status.push("discounted");

        let index = status.indexOf("discounted");
        if ((Number(discountPercent) === 0) && index > -1) status.splice(index, 1);

        const updatedProduct = await productModel.findByIdAndUpdate(
            req.params.id,
            {
                productImages: updatedImages,
                title,
                description,
                category,
                stock,
                price,
                discountPercent,
                discountExpiryDate: Number(discountPercent) !== 0 ? discountExpiryDate : new Date(),
                salesPrice,
                amountToGet,
                shippingFees,
                tags,
                status
            },
            { new: true, runValidators: true }
        );

        if (product.category !== category) {
            await categoryModel.findOneAndUpdate(
                { name: product.category },
                { $inc: { count: -1 } }
            );
            await categoryModel.findOneAndUpdate(
                { name: category },
                { $inc: { count: 1 } }
            );
        }

        res.status(200).json({
            success: true,
            message: "Product Updated",
            product: updatedProduct
        });
    } catch (e) {
        res.status(400);
        throw new Error(e);
    }
});

exports.deleteProduct = asyncHandler(async (req, res) => {

    let product = await productModel.findById(req.params.id);

    if (!product) {
        res.status(404)
        throw new Error("Product not found!")
    }

    if (product.sellerId.toString() !== req.user.sellerId._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to delete this product');
    }

    await categoryModel.findOneAndUpdate(
        { name: product.category },
        { $inc: { count: -1 } }
    );

    await productModel.findByIdAndDelete(product._id);

    res.status(200).json({
        success: true,
        message: "Product Deleted successfully"
    })
})

exports.getRecentlyViewedProducts = asyncHandler(async (req, res) => {

    let recentlyViewed = [];

    if (req.user)
        recentlyViewed = await recentlyViewedModel.findOne({ userId: req.user._id }).populate('viewedProducts');

    res.status(200).json({
        success: true,
        recentlyViewed
    });
})

exports.addRecentlyViewedProduct = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.body;
    let recentlyViewed = await recentlyViewedModel.findOne({ userId });

    if (!recentlyViewed) {
        recentlyViewed = new recentlyViewedModel({ userId, viewedProducts: [] });
    }

    recentlyViewed.viewedProducts = recentlyViewed.viewedProducts.filter(
        (id) => id.toString() !== productId.toString()
    );

    recentlyViewed.viewedProducts.unshift(productId);

    if (recentlyViewed.viewedProducts.length > 10) {
        recentlyViewed.viewedProducts.pop();
    }

    await recentlyViewed.save();

    res.status(200).json({ success: true, recentlyViewed });
});

exports.getCategoryProducts = asyncHandler(async (req, res) => {
    const { categoryName } = req.params;
    const { minPrice, maxPrice, rating, page = 1, limit = 40 } = req.query;

    let filter = { category: categoryName };
    if (minPrice !== undefined) filter.salesPrice = { $gte: Number(minPrice) };
    if (maxPrice !== undefined) filter.salesPrice = { ...filter.salesPrice, $lte: Number(maxPrice) };
    if (rating !== undefined && Number(rating) > 0) filter.rating = { $gte: Number(rating) };
    else if (rating !== undefined && Number(rating) === 0) filter.rating = { $lte: Number(rating) };

    const products = await productModel.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalProducts = await productModel.countDocuments(filter);

    res.status(200).json({
        success: true,
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
    });
});