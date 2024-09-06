const express = require('express');
const router = express.Router();
const { authorized } = require('../middlewares/authorization');
const { postRequest, editRequest, deleteRequest, getAllRequests, getUserRequests, getRequest, getRequestOffers, postOffer, editOffer, deleteOffer, getSellerOffers } = require('../controllers/tradeleadCtrl');

router.get('/requests/all', authorized, getAllRequests);
router.get('/requests/user', authorized, getUserRequests);
router.get('/request/:requestId', authorized, getRequest);
router.post('/request', authorized, postRequest);
router.put('/request/:requestId', authorized, editRequest);
router.delete('/request/:requestId', authorized, deleteRequest);
router.get('/offers/:requestId', authorized, getRequestOffers);

router.post('/offer/:requestId', authorized, postOffer);
router.put('/offer/:requestId/:offerId', authorized, editOffer);
router.delete('/offer/:requestId/:offerId', authorized, deleteOffer);
router.get('/myOffers', authorized, getSellerOffers);

module.exports = router;
