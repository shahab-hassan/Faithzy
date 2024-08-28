const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken")
const passport = require("passport");

const userModel = require("../models/userModel")
const adminSettingsModel = require("../models/adminSettingsModel")
const sendToken = require("../utils/sendToken")
const sendEmail = require("../utils/sendEmail")

exports.getUser = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.params.id).populate("sellerId");
    if (!user) {
        res.status(404)
        throw new Error("User not found!");
    }
    return res.status(200).json({ success: true, user });
})

exports.getAllUsers = asyncHandler(async (req, res) => {
    const { filterType } = req.query;
    let query = {};

    if (filterType === 'Active') query.userStatus = 'Active';
    else if (filterType === 'Blocked') query.userStatus = 'Blocked';

    const allUsers = await userModel.find(query).populate('sellerId').sort({ updatedAt: -1 });
    res.status(200).json({ success: true, allUsers });
})

exports.registerUser = asyncHandler(async (req, res) => {

    let { username, email, password, confirmPass, role } = req.body;

    if (!username || !email || !password || !confirmPass) {
        res.status(400)
        throw new Error("All fields are required!")
    }

    if (await userModel.findOne({ username })) {
        res.status(400)
        throw new Error("Username already taken!")
    }
    if (await userModel.findOne({ email })) {
        res.status(400)
        throw new Error("Email is already registered!")
    }
    if (password.length < 8) {
        res.status(400)
        throw new Error("Use 8 or more characters with a mix of letters, numbers & symbols!")
    }

    if (password !== confirmPass) {
        res.status(400)
        throw new Error("Passwords do not match...")
    }

    let hashPassword = await bcrypt.hash(password, 10);

    let newUser;
    try {
        newUser = await userModel.create({ username, email, password: hashPassword, role });
        await adminSettingsModel.findOneAndUpdate(
            {},
            { $inc: { registeredUsers: 1 } },
            { new: true, upsert: true }
        );
    }
    catch (e) {
        res.status(400)
        throw new Error(e)
    }

    res.status(201).json({
        success: true,
        newUser
    })
})

exports.loginUser = asyncHandler(async (req, res) => {

    let { email, password } = req.body;

    if (!email || !password) {
        res.status(400)
        throw new Error("All fields are Required!")
    }

    let user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        res.status(401)
        throw new Error("Email is not registered...")
    }

    if (user.userStatus === 'Blocked') {
        res.status(403)
        throw new Error("Your account has been blocked!");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)

    if (!isPasswordMatched) {
        res.status(401)
        throw new Error("Incorrect email or password!");
    }

    sendToken(user, res);

})

exports.logoutUser = asyncHandler(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    req.user = undefined;
    res.status(200).json({
        success: true,
        message: "Logged out!"
    })
})

exports.resetPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found with this email");
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `http://localhost:3000/resetPassword/${resetToken}`;

    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: message,
        });

        res.status(200).json({ success: true, message: "Email sent" });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500);
        throw new Error("Email could not be sent");
    }
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error("Invalid token or token has expired");
    }

    const { password, confirmPass } = req.body;
    if (password !== confirmPass) {
        res.status(400);
        throw new Error("Passwords do not match");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
});

exports.onGoogleLoginSuccess = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/login' }, (err, user, info) => {
        if (err || !user) {
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.redirect('/login');
            }
            const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRY });
            res.redirect(`http://localhost:3000/?token=${token}`);
        });
    })(req, res, next);
}

exports.onFacebookLoginSuccess = (req, res, next) => {
    passport.authenticate('facebook', { failureRedirect: '/login' }, (err, user, info) => {
        if (err || !user) {
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.redirect('/login');
            }
            const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRY });
            res.redirect(`http://localhost:3000/?token=${token}`);
        });
    })(req, res, next);
}

exports.updateEmailAndUsername = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
        res.status(404)
        throw new Error("User not found!")
    }
    user.username = req.body.username;
    user.email = req.body.email;
    await user.save();
    res.status(200).json({ success: true, message: 'User updated!' })
})

exports.updatePassword = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
        res.status(400);
        throw new Error("All fields are required!");
    }

    const user = await userModel.findById(userId).select("+password");
    if (!user) {
        res.status(404);
        throw new Error("User not found!");
    }

    const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
        res.status(400);
        throw new Error("Old password is incorrect!");
    }

    if (newPassword !== confirmNewPassword) {
        res.status(400);
        throw new Error("New passwords do not match!");
    }

    if (newPassword.length < 8) {
        res.status(400);
        throw new Error("Password should be at least 8 characters long!");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully!" });
});

exports.blockUser = asyncHandler(async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user)
            return res.status(404).json({ success: false, message: "User not found!" });
        if (!req.body.isBlocked)
            user.userStatus = 'Blocked';
        else
            user.userStatus = 'Active';
        await user.save();
        res.status(200).json({ success: true, message: "User blocked successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});
