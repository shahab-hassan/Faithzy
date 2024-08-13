const asyncHandler = require("express-async-handler");
const wishlistModel = require("../models/wishlistModel");

// wishlistCtrl.js
exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlists = await wishlistModel.findOne({ userId: req.user._id })
    .populate({
      path: 'products',
      populate: {
        path: 'sellerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'username',
        }
      }
    })
    .populate({
      path: 'services',
      populate: {
        path: 'sellerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'username',
        }
      }
    });

  // if (!wishlists) {
  //   res.status(404);
  //   throw new Error("Wishlist not found");
  // }

  res.status(200).json({
    success: true,
    wishlists
  });
});


exports.addToWishlist = asyncHandler(async (req, res) => {
  const { itemId, itemType } = req.body;
  let wishlist = await wishlistModel.findOne({ userId: req.user._id });

  if (!wishlist)
    wishlist = new wishlistModel({ userId: req.user._id, products: [], services: [] })

  if (itemType === "product") {
    if (!wishlist.products.includes(itemId)) {
      wishlist.products.push(itemId);
    }
  } else if (itemType === "service") {
    if (!wishlist.services.includes(itemId)) {
      wishlist.services.push(itemId);
    }
  } else {
    res.status(400);
    throw new Error("Invalid item type");
  }

  await wishlist.save();
  res.status(200).json({ success: true, message: "Product Added to Wishlist!" });
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { itemId, itemType } = req.body;
  let wishlist = await wishlistModel.findOne({ userId: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error("Wishlist not found");
  }

  if (itemType === "product") {
    wishlist.products = wishlist.products.filter(id => id.toString() !== itemId);
  } else if (itemType === "service") {
    wishlist.services = wishlist.services.filter(id => id.toString() !== itemId);
  } else {
    res.status(400);
    throw new Error("Invalid item type");
  }

  await wishlist.save();
  res.status(200).json({ success: true, wishlist });
});