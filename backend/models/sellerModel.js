const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const sellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  profileImage: { type: String, required: true },
  fullName: { type: String, required: true },
  companyName: String,
  displayName: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  selling: { type: String, required: true },
  languages: { type: [String], required: true },
  sellerType: { type: String, enum: ['Free', 'Paid'], default: "Free" },
  plan: {type: {
    months: {type: Number},
    price: {type: Number},
    startDate: {type: Date},
    endDate: {type: Date},
    paymentMethod: { type: String, enum: ['stripe', 'paypal'], required: true },
    paypalOrderId: String,
    clientSecret: String
  }},
  rating: { type: Number, default: 0 },
  noOfReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
}, { timestamps: true });

module.exports = mongoose.model('Seller', sellerSchema);
