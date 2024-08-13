const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    quoteType: { type: String, enum: ['product', 'service'], required: true },
    productId: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Product',
        validate: {
            validator: function(value) {
                if (this.quoteType === 'product') {
                    return !!value; // Ensure productId is not null or undefined
                }
                return !value; // Ensure productId is not provided when quoteType is 'service'
            },
            message: props => 
                props.value 
                    ? 'Product ID should not be provided when quoteType is service' 
                    : 'Product ID is required when quoteType is product'
        }
    },
    serviceId: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Service',
        validate: {
            validator: function(value) {
                if (this.quoteType === 'service') {
                    return !!value; // Ensure serviceId is not null or undefined
                }
                return !value; // Ensure serviceId is not provided when quoteType is 'product'
            },
            message: props => 
                props.value 
                    ? 'Service ID should not be provided when quoteType is product' 
                    : 'Service ID is required when quoteType is service'
        }
    },
    title: {type: String},
    description: { type: String },
    offerAmount: { type: Number, required: true },
    quantity: { 
        type: Number, 
        default: 1,
        validate: {
            validator: function(value) {
                return this.quoteType === 'product' ? !!value : true;
            },
            message: 'Quantity is required when quoteType is product'
        }
    },
    shippingFee: { 
        type: Number, 
        default: 0,
        validate: {
            validator: function(value) {
                return this.quoteType === 'product' ? !!value : true;
            },
            message: 'Shipping Fee is required when quoteType is product'
        }
    },
    duration: { 
        type: Number, 
        default: 1,
        validate: {
            validator: function(value) {
                return this.quoteType === 'service' ? !!value : true;
            },
            message: 'Duration is required when quoteType is service'
        }
    }
});

const messageSchema = new Schema({
    senderId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    text: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    timestamp: { type: Date, default: Date.now },
    offer: offerSchema
});

const chatSchema = new Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    chats: [{
        participantId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
        messages: [messageSchema]
    }]
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
