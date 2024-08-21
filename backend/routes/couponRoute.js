const express = require('express');
const router = express.Router();

const { authorizeAdmin} = require('../middlewares/authorization');

const {
    getAllCoupons,
    getActiveCoupons,
    getExpiredCoupons,
    getScheduledCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    applyCoupon
} = require('../controllers/couponCtrl');


router.get('/', authorizeAdmin, getAllCoupons);

router.get('/active', authorizeAdmin, getActiveCoupons);

router.get('/expired', authorizeAdmin, getExpiredCoupons);

router.get('/scheduled', authorizeAdmin, getScheduledCoupons);

router.post('/new', authorizeAdmin, createCoupon);

router.put('/:id', authorizeAdmin, updateCoupon);

router.delete('/:id', authorizeAdmin, deleteCoupon);

router.post('/apply', applyCoupon);

module.exports = router;