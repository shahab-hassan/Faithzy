const express = require("express");
const router = express.Router();
const passport = require("passport");

const { registerUser, loginUser, logoutUser, resetPasswordRequest, resetPassword, onGoogleLoginSuccess, onFacebookLoginSuccess, updateEmailAndUsername, updatePassword, getUser, getAllUsers, blockUser, verifyEmail, resendVerificationEmail } = require("../controllers/userCtrl");
const { authorized, authorizeAdmin } = require("../middlewares/authorization");
const userModel = require("../models/userModel")

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

router.post("/resetPasswordRequest", resetPasswordRequest);
router.post("/resetPassword/:token", resetPassword);

router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/login/google/callback', onGoogleLoginSuccess);

router.get('/login/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/login/facebook/callback', onFacebookLoginSuccess);

router.get('/getUser/:id', getUser);

router.get('/all', authorizeAdmin, getAllUsers);

router.put('/block/', authorizeAdmin, blockUser);


router.get('/checkLogin', authorized, async (req, res) => {
  const user = await userModel.findById(req.user._id).populate("sellerId");
  if (!user){
    res.status(404)
    throw new Error ("User not found!");
  }
  return res.status(200).json({ success: true, isLogin: true, user });
});

router.put("/updateUser/:userId", authorized, updateEmailAndUsername)

router.put("/updatePassword/:userId", authorized, updatePassword);

router.get('/verifyEmail/:token', verifyEmail);

router.post('/resend-verification', resendVerificationEmail);


module.exports = router;