const Chat = require('../models/chatModel');
const { io, getReceiverSocketId } = require('../config/socket');
const path = require('path');
const asyncHandler = require('express-async-handler');
const sendEmail = require("../utils/sendEmail");
const { receivedChatMessage, receivedOfferMessage, receivedChatMessageFromAdmin } = require('../utils/emailTemplates');

exports.sendMessage = asyncHandler(async (req, res) => {
    let { senderId, receiverId, receiverEmail, text, offer, isParticipantAdmin } = req.body;

    const message = {
        senderId,
        text,
        timestamp: new Date(),
    };

    if (offer) {
        const parsedOffer = JSON.parse(offer);

        if (parsedOffer.quoteType === 'product') {
            parsedOffer.serviceId = null;
        } else if (parsedOffer.quoteType === 'service') {
            parsedOffer.productId = null;
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
            senderChat = new Chat({ isAdmin: false, userId: senderId, chats: [] });
        }

        let isNewChat = false;

        let senderReceiverChat = senderChat.chats.find(c => c.participantId?.toString() === receiverId || c.adminParticipantId?.toString() === receiverId);
        if (!senderReceiverChat) {
            isNewChat = true;
            if (isParticipantAdmin === "true")
                senderReceiverChat = { isParticipantAdmin: true, adminParticipantId: receiverId, messages: [message] };
            else
                senderReceiverChat = { isParticipantAdmin: false, participantId: receiverId, messages: [message] };

            senderChat.chats.push(senderReceiverChat);
        } else {
            senderReceiverChat.messages.push(message);
        }
        await senderChat.save();



        if (senderId.toString() !== receiverId.toString()) {
            let receiverChat = await Chat.findOne(isParticipantAdmin === "true" ? { adminId: receiverId } : { userId: receiverId });
            if (!receiverChat) {
                if (isParticipantAdmin === "true")
                    receiverChat = new Chat({ isAdmin: true, adminId: receiverId, chats: [] });
                else
                    receiverChat = new Chat({ isAdmin: false, userId: receiverId, chats: [] });
            }

            let receiverSenderChat = receiverChat.chats.find(c => c.participantId?.toString() === senderId || c.adminParticipantId?.toString() === senderId);
            if (!receiverSenderChat) {
                receiverSenderChat = { isParticipantAdmin: false, participantId: senderId, messages: [message] };
                receiverChat.chats.push(receiverSenderChat);
            } else {
                receiverSenderChat.messages.push(message);
            }
            await receiverChat.save();
            io.to(getReceiverSocketId(receiverId)).emit('receiveMessage', message);

            if (isParticipantAdmin === "false" && (isNewChat || offer)) {
                setImmediate(async () => {
                    try {
                        const messageLink = `https://localhost:3000/chat/${senderId}`;
                        const emailContent = offer ? receivedOfferMessage(messageLink) : receivedChatMessage(messageLink);

                        await sendEmail({
                            to: receiverEmail,
                            subject: offer ? "Faithzy - New Offer Received" : "Faithzy - New Message Received",
                            text: emailContent,
                        });
                    } catch (error) {
                        console.error("Failed to send email:", error.message);
                    }
                });
            }

        }

        res.status(200).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.adminSendMessage = asyncHandler(async (req, res) => {
    const { senderId, receiverId, receiverEmail, text } = req.body;

    const message = {
        senderId,
        text,
        timestamp: new Date(),
    };

    if (req.file) {
        message.fileUrl = path.join('uploads', req.file.filename);
        message.fileType = req.file.mimetype;
    }

    try {
        let senderChat = await Chat.findOne({ adminId: senderId });
        if (!senderChat) {
            senderChat = new Chat({ isAdmin: true, adminId: senderId, chats: [] });
        }

        let isNewChat = false;

        let senderReceiverChat = senderChat.chats.find(c => c.participantId?.toString() === receiverId);
        if (!senderReceiverChat) {
            isNewChat = true;
            senderReceiverChat = { isParticipantAdmin: false, participantId: receiverId, messages: [message] };
            senderChat.chats.push(senderReceiverChat);
        } else {
            senderReceiverChat.messages.push(message);
        }
        await senderChat.save();

        if (senderId.toString() !== receiverId.toString()) {
            let receiverChat = await Chat.findOne({ userId: receiverId });
            if (!receiverChat) {
                receiverChat = new Chat({ isAdmin: false, userId: receiverId, chats: [] });
            }

            let receiverSenderChat = receiverChat.chats.find(c => c.participantId?.toString() === senderId || c.adminParticipantId?.toString() === senderId);
            if (!receiverSenderChat) {
                receiverSenderChat = { isParticipantAdmin: true, adminParticipantId: senderId, messages: [message] };
                receiverChat.chats.push(receiverSenderChat);
            } else {
                receiverSenderChat.messages.push(message);
            }
            await receiverChat.save();
            io.to(getReceiverSocketId(receiverId)).emit('receiveMessage', message);

            if (isNewChat) {
                setImmediate(async () => {
                    try {
                        const messageLink = `https://localhost:3000/chat/${senderId}`;
                        const emailContent = receivedChatMessageFromAdmin(messageLink)

                        await sendEmail({
                            to: receiverEmail,
                            subject: "Faithzy - New Message Received",
                            text: emailContent,
                        });
                    } catch (error) {
                        console.error("Failed to send email:", error.message);
                    }
                });
            }

        }

        res.status(200).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.getUserChats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    try {
        const chat = await Chat.findOne({ userId });
        if (!chat) {
            return res.status(200).json({ success: true, chats: [] });
        }

        if (chat.chats.some(c => c.participantId)) {
            await chat.populate({
                path: 'chats.participantId',
                populate: { path: 'sellerId' }
            });
        }

        if (chat.chats.some(c => c.adminParticipantId)) {
            await chat.populate({
                path: 'chats.adminParticipantId',
            });
        }

        chat.chats = chat.chats.sort((a, b) => {
            const lastMessageA = a.messages[a.messages.length - 1]?.timestamp || new Date(0);
            const lastMessageB = b.messages[b.messages.length - 1]?.timestamp || new Date(0);
            return new Date(lastMessageB) - new Date(lastMessageA);
        });

        res.status(200).json({ success: true, chats: chat.chats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

exports.getAdminChats = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    try {
        const chat = await Chat.findOne({ adminId })
            .populate({
                path: 'chats.participantId',
                populate: { path: 'sellerId' }
            });

        if (chat) {
            chat.chats = chat.chats.sort((a, b) => {
                const lastMessageA = a.messages[a.messages.length - 1]?.timestamp || new Date(0);
                const lastMessageB = b.messages[b.messages.length - 1]?.timestamp || new Date(0);
                return new Date(lastMessageB) - new Date(lastMessageA);
            });
        }

        res.status(200).json({ success: true, chats: chat ? chat.chats : [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// exports.getUserChats = asyncHandler(async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const chat = await Chat.findOne({ userId }).sort({updatedAt: -1});
//         if (!chat)
//             return res.status(200).json({ success: true, chats: [] });

//         if (chat.chats.some(c => c.participantId)) {
//             await chat.populate({
//                 path: 'chats.participantId',
//                 populate: { path: 'sellerId' }
//             });
//         }

//         if (chat.chats.some(c => c.adminParticipantId)) {
//             await chat.populate({
//                 path: 'chats.adminParticipantId',
//             });
//         }

//         res.status(200).json({ success: true, chats: chat });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

// exports.getAdminChats = asyncHandler(async (req, res) => {
//     const { adminId } = req.params;
//     try {
//         const chat = await Chat.findOne({ adminId })
//             .populate({
//                 path: 'chats.participantId',
//                 populate: { path: 'sellerId' }
//             });
//         res.status(200).json({ success: true, chats: chat ? chat.chats.reverse() : [] });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

exports.getOfferDetails = asyncHandler(async (req, res) => {
    try {
        const { messageId } = req.params;

        const chat = await Chat.findOne({
            'chats.messages._id': messageId
        })
            .populate({
                path: 'chats.messages.offer.productId chats.messages.offer.serviceId',
                populate: { path: 'sellerId' }
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