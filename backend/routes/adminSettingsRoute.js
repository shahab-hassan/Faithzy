const express = require('express');
const router = express.Router();
const { getTerms, createOrUpdateTerms, getSocialLinks, createOrUpdateSocialLinks, getAdminFeesAndMembership, updateAdminFees, updateAdminMembership, getGeneralDashboardInfo, getRevenueAndProfitDetails, sendEmailToUserFromAdmin, receiveEmailFromUser } = require('../controllers/adminSettingsCtrl');
const { authorizeAdmin } = require('../middlewares/authorization');

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

module.exports = router;