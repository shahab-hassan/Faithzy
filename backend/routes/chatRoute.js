const express = require('express');
const router = express.Router();
const { sendMessage, getUserChats, getOfferDetails, getAdminChats, adminSendMessage } = require('../controllers/chatCtrl');
const { authorized, authorizeAdmin } = require('../middlewares/authorization');
const upload = require('../config/chatMulter');

router.post('/sendMessage/user', authorized, (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) return next(err);
        sendMessage(req, res, next);
    });
});
router.post('/sendMessage/admin', authorizeAdmin, (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) return next(err);
        adminSendMessage(req, res, next);
    });
});
router.get('/userChats/:userId', authorized, getUserChats);
router.get('/adminChats/:adminId', authorizeAdmin, getAdminChats);
router.get('/offer/details/:messageId', authorized, getOfferDetails);

module.exports = router;