const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  products: [
    { type: mongoose.Schema.ObjectId, ref: "Product" }
  ],
  services: [
    { type: mongoose.Schema.ObjectId, ref: "Service" }
  ]
});

module.exports = mongoose.model('Wishlist', wishlistSchema);