const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderId: { type: String, required: true },
    text: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const disputeSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.ObjectId, ref: "Seller", required: true },
    orderId: { type: String, required: true },
    subOrderId: { type: String },
    initiatedBy: { type: String, enum: ["Buyer", "Seller"] },
    orderAmount: { type: Number, required: true },
    provisionType: { type: String, enum: ["Product", "Service"] },
    reason: { type: String, required: true },
    status: { type: String, required: true, enum: ["InProgress", "Resolved"], default: "InProgress" },
    resolutionDate: { type: Date },
    amountToBuyer: { type: Number },
    amountToSeller: { type: Number },
    messages: [messageSchema]
},
    { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);