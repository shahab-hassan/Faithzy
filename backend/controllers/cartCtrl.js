const asyncHandler = require("express-async-handler");
const cartModel = require("../models/cartModel");



exports.getCarts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await cartModel.findOne({ userId }).populate('products.product');

  // if (!cart) {
  //   return res.status(404).json({
  //     success: false,
  //     message: 'Cart not found'
  //   });
  // }

  res.status(200).json({
    success: true,
    cart
  });
});



exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, count } = req.body;
  const userId = req.user._id;

  let cart = await cartModel.findOne({ userId });

  if (cart) {
    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex > -1) {
      res.status(400)
      throw new Error("Product is already in Cart!")
    } 
    else
      cart.products.push({ product: productId, count });
  } else {
    cart = new cartModel({
      userId,
      products: [{ product: productId, count }]
    });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Product added to cart',
    cart
  });
});



exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  let cart = await cartModel.findOne({ userId });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  cart.products = cart.products.filter(p => p.product.toString() !== productId);

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from cart',
    cart
  });
});



exports.updateCart = asyncHandler(async (req, res) => {
  const { productId, count } = req.body;

  const userId = req.user._id;

  let cart = await cartModel.findOne({ userId });

  if (cart) {
    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex > -1)
      cart.products[productIndex].count += count;
    else {
      res.status(400)
      throw new Error("Product not found in Cart!")
    }
  } else {
    res.status(400)
    throw new Error("Product not found in Cart!")
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Product updated in cart',
    cart
  });
});