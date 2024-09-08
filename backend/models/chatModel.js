const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    quoteType: { type: String, enum: ['product', 'service'], required: true },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        validate: {
            validator: function (value) {
                return this.quoteType === 'product' ? !!value : !value;
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
            validator: function (value) {
                return this.quoteType === 'service' ? !!value : !value;
            },
            message: props =>
                props.value
                    ? 'Service ID should not be provided when quoteType is product'
                    : 'Service ID is required when quoteType is service'
        }
    },
    title: { type: String },
    description: { type: String },
    offerAmount: { type: Number, required: true },
    quantity: {
        type: Number,
        default: 1
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 1
    }
});

const messageSchema = new Schema({
    senderId: { type: String, required: true },
    text: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    timestamp: { type: Date, default: Date.now },
    offer: offerSchema
});

const singleChatSchema = new Schema({
    isParticipantAdmin: { type: Boolean },
    participantId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        validate: {
            validator: function (value) {
                return this.isParticipantAdmin ? !value : !!value;
            },
            message: props =>
                props.value
                    ? 'Admin Participant ID is required when isParticipantAdmin is true'
                    : 'Admin Participant ID should not be provided when isParticipantAdmin is false'
        }
    },
    adminParticipantId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admin',
        validate: {
            validator: function (value) {
                return this.isParticipantAdmin ? !!value : !value;
            },
            message: props =>
                props.value
                    ? 'Admin Participant ID is required when isParticipantAdmin is true'
                    : 'Admin Participant ID should not be provided when isParticipantAdmin is false'
        }
    },
    messages: [messageSchema]
}, {timestamps: true});

const chatSchema = new Schema({
    isAdmin: { type: Boolean },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        validate: {
            validator: function (value) {
                return this.isAdmin ? !value : !!value;
            },
            message: props =>
                props.value
                    ? 'User ID should not be provided when isAdmin is true'
                    : 'User ID is required when isAdmin is false'
        }
    },
    adminId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admin',
        validate: {
            validator: function (value) {
                return this.isAdmin ? !!value : !value;
            },
            message: props =>
                props.value
                    ? 'Admin ID is required when isAdmin is true'
                    : 'Admin ID should not be provided when isAdmin is false'
        }
    },
    chats: [singleChatSchema]
}, {timestamps: true});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;