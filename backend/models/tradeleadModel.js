const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
}, 
{timestamps: true}
);

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  duration: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
  offers: [offerSchema]
},
{timestamps: true}
);

const tradeleadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  requests: [requestSchema]
});

module.exports = mongoose.model('Tradelead', tradeleadSchema);