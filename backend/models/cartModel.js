const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  products: [
    { 
        product: {type: mongoose.Schema.ObjectId, ref: "Product"},
        count: {type: Number, default: 1}
    }
  ],
});

module.exports = mongoose.model('Cart', cartSchema);