const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  orderId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  reply: String,
}, { timestamps: true });

const packageSchema = new mongoose.Schema({
  name: { type: String, enum: ["BASIC", "STANDARD", "ULTIMATE"], required: true },
  title: { type: String, required: [true, "Package title is required"] },
  description: { type: String, required: [true, "Package description is required"] },
  price: { type: Number, required: [true, "Package price is missing"], min: [5, "Price cannot be less than $5"], max: [1000000, "Price cannot exceed 1 Million"] },
  amountToGet: { type: Number, required: [true, "Amount is missing"] },
  salesPrice: { type: Number, required: true },
  deliveryDays: { type: Number, required: [true, "Package delivery time is missing"], default: 1, min: [1, "Delivery days can't be less than 1"], max: [1000, "Delivery days cannot exceed 1000"] },
});

const serviceSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.ObjectId, ref: "Seller", required: true },
  title: { type: String, required: [true, "Please Enter post title"] },
  description: { type: String, required: [true, "Please Enter post Description"] },
  category: { type: String, required: [true, "Please Enter post Category"] },
  packages: [packageSchema],
  discountPercent: { type: Number, default: 0, min: [0, "Discount percentage can't be less than 0"], max: [100, "Discount percentage can't be greater than 100"] },
  discountExpiryDate: { type: Date, default: Date.now },
  tags: { type: [String] },
  serviceImages: [String],
  questions: [String],
  rating: { type: Number, default: 0 },
  noOfReviews: { type: Number, default: 0 },
  status: { type: [String], default: ["new", "freeSeller"] },
  reviews: [reviewSchema],
  sold: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);