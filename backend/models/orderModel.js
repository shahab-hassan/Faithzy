const mongoose = require('mongoose');

const productOrder = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  count: { type: Number, default: 1 },
  sellerToGet: {
    salesPrice: Number,
    shippingFees: Number,
    subtotal: Number,
    tax: Number,
    total: Number
  },
  buyerPaid: {
    salesPrice: Number,
    shippingFees: Number,
    subtotal: Number,
    tax: Number,
    total: Number
  },
  status: { type: [{ name: String, createdAt: Date }], required: true, default: [{ name: "Active", createdAt: Date.now() }] },
  crrStatus: {type: String, required: true, default: "Active"},
  netProfit: {type: Number, required: true, default: 0},
  cancellationReason: String,
  cancellationFrom: {type: String, enum: ["Buyer", "Seller"]},
  isReviewSubmitted: {type: Boolean, default: false}
})

const productOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  products: [productOrder],

  summary: {
    paidByBuyer: {
      totalSalesPrice: Number,
      totalShipping: Number,
      subtotal: Number,
      tax: Number,
      total: Number,
      promoDiscount: Number
    }
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal'],
    required: true
  },
  billingInfo: {
    firstName: String,
    lastName: String,
    address: String,
    country: String,
    state: String,
    city: String,
    zipCode: String,
    email: String,
    phoneNumber: String,
    note: String
  },
  clientSecret: String
}, { timestamps: true });


const historySchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ["orderPlaced", "requirementsRequired", "requirementsSubmitted", "orderStarted", "extensionRequested", "extensionAccepted", "extensionDeclined", "deliverySent", "deliveryAccepted", "askedForRevision", "cancellationSent", "cancellationAccepted", "cancellationDeclined"] },
  message: { type: String, required: true },
  description: { type: { text: String, images: [String], extensionDays: Number } },
  role: { type: String, enum: ["Buyer", "Seller"] },
  isDone: { type: Boolean },
  createdAt: { type: Date }
})

const serviceOrder = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  pkg: { type: { name: String, title: String, description: String, deliveryDays: Number } },
  status: { type: [{ name: String, createdAt: Date }], required: true, default: [{ name: "Active", createdAt: Date.now() }] },
  crrStatus: {type: String, required: true, default: "Active"},
  history: [historySchema],
  cancellationReason: String
})

const serviceOrderSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  service: serviceOrder,

  summary: {
    paidByBuyer: {
      salesPrice: Number,
      tax: Number,
      total: Number,
      promoDiscount: Number
    },
    sellerToGet: {
      salesPrice: Number,
      tax: Number,
      total: Number,
    }
  },
  
  netProfit: {type: Number, required: true, default: 0},
  
  paymentMethod: { type: String, enum: ['stripe', 'paypal'], required: true },

  buyerInfo: {
    firstName: String,
    lastName: String,
    country: String,
    city: String,
    email: String,
    phoneNumber: String,
    paypalOrderId: String,
  },
  answers: [String],
  clientSecret: String
}, { timestamps: true });


const productOrderModel = mongoose.model('ProductOrder', productOrderSchema);
const serviceOrderModel = mongoose.model('ServiceOrder', serviceOrderSchema);
module.exports = { productOrderModel, serviceOrderModel };