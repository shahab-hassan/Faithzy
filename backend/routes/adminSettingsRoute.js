const express = require('express');
const router = express.Router();
const { addPayoneerKeys, getTerms, createOrUpdateTerms, getSocialLinks, createOrUpdateSocialLinks, getAdminFeesAndMembership, updateAdminFees, updateAdminMembership, getGeneralDashboardInfo, getRevenueAndProfitDetails, sendEmailToUserFromAdmin, receiveEmailFromUser, addStripeKeys, getKeys } = require('../controllers/adminSettingsCtrl');
const { authorizeAdmin, authorized, combinedAuthorization } = require('../middlewares/authorization');

router.get('/terms', getTerms);
router.post('/terms', authorizeAdmin, createOrUpdateTerms);

router.get('/social-links', getSocialLinks);
router.post('/social-links', authorizeAdmin, createOrUpdateSocialLinks);

router.get('/feesAndMembership', getAdminFeesAndMembership);
router.post('/update/fees', authorizeAdmin, updateAdminFees);
router.post('/update/membership', authorizeAdmin, updateAdminMembership);

router.get('/dashboard/general', getGeneralDashboardInfo);

router.get('/revenue', getRevenueAndProfitDetails);

router.post('/send/email', sendEmailToUserFromAdmin);

router.post('/receive/email', receiveEmailFromUser);

router.post('/stripe_keys', authorizeAdmin, addStripeKeys);

router.get('/keys', combinedAuthorization, getKeys);

router.post('/payoneer_keys', authorizeAdmin, addPayoneerKeys);

module.exports = router;