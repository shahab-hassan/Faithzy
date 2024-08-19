const express = require('express');
const router = express.Router();
const { getTerms, createOrUpdateTerms, getSocialLinks, createOrUpdateSocialLinks } = require('../controllers/adminSettingsCtrl');
const { authorizeAdmin } = require('../middlewares/authorization');

router.get('/terms', getTerms);
router.post('/terms', authorizeAdmin, createOrUpdateTerms);

router.get('/social-links', getSocialLinks);
router.post('/social-links', authorizeAdmin, createOrUpdateSocialLinks);

module.exports = router;