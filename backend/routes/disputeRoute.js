const express = require('express');
const { sendDisputeMessage, getDispute, getAllDisputes, startNewProductOrderDispute } = require('../controllers/disputeCtrl');
const { authorized, authorizeAdmin, combinedAuthorization } = require('../middlewares/authorization');
const router = express.Router();
const upload = require('../config/chatMulter');

router.get('/all', authorizeAdmin, getAllDisputes);

router.get('/dispute/:id', combinedAuthorization, getDispute);

router.post('/product/new', authorized, startNewProductOrderDispute);

router.post('/sendMessage', combinedAuthorization, (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) return next(err);
        sendDisputeMessage(req, res, next);
    });
});

module.exports = router;