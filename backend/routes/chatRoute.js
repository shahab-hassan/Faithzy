const express = require('express');
const router = express.Router();
const { sendMessage, getUserChats, getOfferDetails } = require('../controllers/chatCtrl');
const { authorized } = require('../middlewares/authorization');
const upload = require('../config/chatMulter');

router.post('/sendMessage', authorized, (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) return next(err);
        sendMessage(req, res, next);
    });
});
router.get('/userChats/:userId', authorized, getUserChats);
router.get('/offer/details/:messageId', authorized, getOfferDetails);

module.exports = router;