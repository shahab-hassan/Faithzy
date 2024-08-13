const Chat = require('../models/chatModel');
const { io, getReceiverSocketId } = require('../config/socket');
const path = require('path');
const asyncHandler = require('express-async-handler');

exports.sendMessage = asyncHandler(async (req, res) => {
    const { senderId, receiverId, text, offer } = req.body;

    const message = {
        senderId,
        text,
        timestamp: new Date(),
    };

    if (offer) {
        const parsedOffer = JSON.parse(offer);

        if (parsedOffer.quoteType === 'product') {
            parsedOffer.serviceId = null; // Ensure serviceId is null if quoteType is product
        } else if (parsedOffer.quoteType === 'service') {
            parsedOffer.productId = null; // Ensure productId is null if quoteType is service
        }

        message.offer = parsedOffer;
    }

    if (req.file) {
        message.fileUrl = path.join('uploads', req.file.filename);
        message.fileType = req.file.mimetype;
    }

    try {
        let senderChat = await Chat.findOne({ userId: senderId });
        if (!senderChat) {
            senderChat = new Chat({ userId: senderId, chats: [] });
        }

        let senderReceiverChat = senderChat.chats.find(c => c.participantId.toString() === receiverId);
        if (!senderReceiverChat) {
            senderReceiverChat = { participantId: receiverId, messages: [message] };
            senderChat.chats.push(senderReceiverChat);
        } else {
            senderReceiverChat.messages.push(message);
        }
        await senderChat.save();

        if (senderId.toString() !== receiverId.toString()) {
            let receiverChat = await Chat.findOne({ userId: receiverId });
            if (!receiverChat) {
                receiverChat = new Chat({ userId: receiverId, chats: [] });
            }

            let receiverSenderChat = receiverChat.chats.find(c => c.participantId.toString() === senderId);
            if (!receiverSenderChat) {
                receiverSenderChat = { participantId: senderId, messages: [message] };
                receiverChat.chats.push(receiverSenderChat);
            } else {
                receiverSenderChat.messages.push(message);
            }
            await receiverChat.save();
            io.to(getReceiverSocketId(receiverId)).emit('receiveMessage', message);
        }

        res.status(200).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.getUserChats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    try {
        const chat = await Chat.findOne({ userId })
            .populate({
                path: 'chats.participantId',
                populate: { path: 'sellerId'}
            });
        res.status(200).json({ success: true, chats: chat ? chat.chats.reverse() : [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.getOfferDetails = asyncHandler(async (req, res) => {
    try {
        const { messageId } = req.params;

        const chat = await Chat.findOne({
            'chats.messages._id': messageId
        })
        .populate({
            path: 'chats.messages.offer.productId chats.messages.offer.serviceId',
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        const offerMessage = chat.chats.flatMap(chat => chat.messages).find(message => message._id.toString() === messageId);

        if (!offerMessage || !offerMessage.offer) {
            return res.status(404).json({ success: false, message: 'Offer not found in the message' });
        }

        res.status(200).json({ success: true, offer: offerMessage.offer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
