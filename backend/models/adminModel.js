const mongoose = require("mongoose");
const crypto = require("crypto");

const adminSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Moderator', 'Admin'], default: "Moderator" },
    // access: {
    //     type: Map,
    //     of: String, // 'View' or 'Edit'
    //     default: {}
    // },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
    {
        timestamps: true
    }
)

adminSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + process.env.RESET_PASSWORD_EXPIRY * 60 * 1000;

    return resetToken;
};

// adminSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) {
//       return next();
//     }
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });


module.exports = mongoose.model("Admin", adminSchema);