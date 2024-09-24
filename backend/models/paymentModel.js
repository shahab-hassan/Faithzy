const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.ObjectId, ref: "Seller", required: true },
    history: [{
        buyerUsername: { type: String },
        amount: { type: Number, required: true },
        itemType: {type: String, enum: ["Product", "Service"]},
        status: {type: String, required: true, enum: ["Earning", "Withdraw", "Paid"]},
        description: {type: String, required: true, enum: ['Order Completed', 'Requested for Withdrawal', 'Amount Paid']},
        date: {type: Date, required: true, default: Date.now}
    }]
}, 
{timestamps: true}
);


const withdrawSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    to: { type: String, required: true, enum: ["Buyer", "Seller"] },
    orderId: { type: String },
    itemType: { type: String, enum: ["Product", "Service"] },
    amount: { type: Number, required: true },
    status: {type: String, required: true, enum: ["Pending", "Paid"], default: "Pending"},
    paymentType: {type: String, enum: ["Auto", "Manual"]},
    paidOn: {type: Date, default: Date.now},
    comment: {type: String},
}, 
{timestamps: true}
);


const paymentModel = mongoose.model('Payment', paymentSchema);
const withdrawModel = mongoose.model('Withdraw', withdrawSchema);
module.exports = {paymentModel, withdrawModel}