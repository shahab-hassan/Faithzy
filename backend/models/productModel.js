const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  subOrderId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  reply: String,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.ObjectId, ref: "Seller", required: true },
  title: { type: String, required: [true, "Please Enter product title"] },
  description: { type: String, required: [true, "Please Enter product Description"] },
  category: { type: String, required: [true, "Please Enter Product Category"] },
  stock: { type: Number, required: [true, "Please Enter product Stock"], maxLength: [5, "Stock cannot exceed 4 characters"], default: 1 },
  price: { type: Number, required: [true, "Please Enter product Price"], max: [1000000, "Price cannot exceed 1 Million"] },
  discountPercent: { type: Number, default: 0, max: [100, "Discount percentage can't be greater than 100"] },
  discountDays: { type: Number, default: 0 },
  salesPrice: { type: Number, required: [true, "Product Sales Price is missing"], max: [1000000, "Price cannot exceed 1 Million"] },
  amountToGet: { type: Number, required: [true, "Amount is missing"], max: [1000000, "Price cannot exceed 1 Million"] },
  shippingFees: { type: Number, required: [true, "Shipping Fees is missing"], default: 0, max: [1000000, "Shipping Fee cannot exceed 1 Million"] },
  tags: { type: [String] },
  productImages: [String],
  rating: { type: Number, default: 0 },
  noOfReviews: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  reviews: [reviewSchema],
  status: { type: [String], default: ["new", "freeSeller"] },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
