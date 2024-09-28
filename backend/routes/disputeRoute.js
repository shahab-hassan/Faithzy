const express = require('express');
const { resolveProductOrderDispute, sendDisputeMessage, getDispute, getAllDisputes, startNewProductOrderDispute, startNewServiceOrderDispute, resolveServiceOrderDispute } = require('../controllers/disputeCtrl');
const { authorized, authorizeAdmin, combinedAuthorization } = require('../middlewares/authorization');
const router = express.Router();
const upload = require('../config/chatMulter');

router.get('/all', authorizeAdmin, getAllDisputes);

router.get('/dispute/:id', combinedAuthorization, getDispute);

router.post('/product/new', authorized, startNewProductOrderDispute);
router.post('/service/new', authorized, startNewServiceOrderDispute);

router.post('/product/resolve', authorizeAdmin, resolveProductOrderDispute);
router.post('/service/resolve', authorizeAdmin, resolveServiceOrderDispute);

router.post('/sendMessage', combinedAuthorization, (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) return next(err);
        sendDisputeMessage(req, res, next);
    });
});

module.exports = router;