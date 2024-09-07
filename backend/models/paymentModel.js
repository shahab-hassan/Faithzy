const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.ObjectId, ref: "Seller", required: true },
    to: { type: String, required: true, enum: ["Buyer", "Seller"] },
    amount: { type: Number, required: true },
    itemType: {type: String, required: true, enum: ["Product", "Service"]},
    status: {type: String, required: true, enum: ["Pending", "Paid"], default: "Pending"},
}, 
{timestamps: true}
);

module.exports = mongoose.model('Payment', paymentSchema);