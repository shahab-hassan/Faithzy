const adminSettingsModel = require('../models/adminSettingsModel');
const asyncHandler = require('express-async-handler');


exports.getTerms = asyncHandler(async (req, res) => {
    try {

        const settings = await adminSettingsModel.findOne({}, 'terms');

        if (!settings || !settings.terms) {
            res.status(404);
            throw new Error("Terms not found!");
        }

        res.status(200).json({ success: true, terms: settings.terms });

    } catch (err) {
        res.status(500);
        throw new Error(err);
    }
});

exports.createOrUpdateTerms = asyncHandler(async (req, res) => {

    const { content } = req.body;

    if (!content) {
        res.status(400);
        throw new Error("Content is required!");
    }

    let settings = await adminSettingsModel.findOne();

    if (settings) {
        settings.terms = content;
        settings = await settings.save();
    } else
        settings = await adminSettingsModel.create({ terms: content });

    res.status(200).json({
        success: true,
        terms: settings.terms
    });
});


exports.getSocialLinks = asyncHandler(async (req, res) => {
    const settings = await adminSettingsModel.findOne({}, 'socialLinks');

    if (!settings || !settings.socialLinks) {
        res.status(404);
        throw new Error("Social links not found!");
    }

    res.status(200).json({ success: true, socialLinks: settings.socialLinks });
});

exports.createOrUpdateSocialLinks = asyncHandler(async (req, res) => {
    const { socialLinks } = req.body;

    if (!socialLinks || Object.keys(socialLinks).length === 0) {
        res.status(400);
        throw new Error("At least one social link is required!");
    }

    let settings = await adminSettingsModel.findOne();

    if (settings) {
        settings.socialLinks = socialLinks;
        settings = await settings.save();
    } else {
        settings = await adminSettingsModel.create({ socialLinks });
    }

    res.status(200).json({ success: true, socialLinks: settings.socialLinks });
});

exports.getAdminFeesAndMembership = asyncHandler(async (req, res) => {
    const settings = await adminSettingsModel.findOne();
    res.status(200).json({success: true, fees: settings.fees, membership: settings.membership});
});

exports.updateAdminFees = asyncHandler(async (req, res) => {
    const { fees } = req.body;

    let settings = await adminSettingsModel.findOne();

    if (!settings) {
        settings = new adminSettingsModel({ fees });
    } else {
        settings.fees = { ...settings.fees, ...fees };
    }

    await settings.save();
    res.status(200).json({ success: true, message: 'Fees updated successfully' });
});

exports.updateAdminMembership = asyncHandler(async (req, res) => {
    const { membership } = req.body;

    let settings = await adminSettingsModel.findOne();

    if (!settings) {
        settings = new adminSettingsModel({ membership });
    } else {
        settings.membership = { ...settings.membership, ...membership };
    }

    await settings.save();
    res.status(200).json({ success: true, message: 'Fees updated successfully' });
});