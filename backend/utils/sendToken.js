const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const sendToken = asyncHandler(async (user, res) => {
    let token = jwt.sign({
        id: user._id
    }, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRY });

    res.status(200).json({
        success: true,
        token,
        user,
    });
});

module.exports = sendToken;
