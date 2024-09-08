const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        validate: [validator.isEmail, "Please enter a valid email..."]
    },
    password: {
        type: String,
        minLength: [8, "Password should be greater than 8 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        default: "buyer",
    },
    sellerId: { type: mongoose.Schema.ObjectId, ref: "Seller" },
    googleId: {
        type: String,
    },
    facebookId: {
        type: String,
    },
    userStatus: { type: String, enum: ['Active', 'Blocked'], default: "Active" },
    verified: {
        type: Boolean,
        default: false,
    },
    
    verifyEmailToken: String,
    verifyEmailExpire: Date,

    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
    {
        timestamps: true
    }
)

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + process.env.RESET_PASSWORD_EXPIRY * 60 * 1000;

    return resetToken;
};

// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) {
//       return next();
//     }
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });


module.exports = mongoose.model("User", userSchema);