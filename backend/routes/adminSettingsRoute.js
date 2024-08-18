const express = require('express');
const router = express.Router();
const { getTerms, createOrUpdateTerms } = require('../controllers/adminSettingsCtrl');
const { authorizeAdmin } = require('../middlewares/authorization');

router.get('/terms', getTerms);
router.post('/terms', authorizeAdmin, createOrUpdateTerms);

module.exports = router;