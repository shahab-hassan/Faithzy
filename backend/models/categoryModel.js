const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    type: { type: String, enum: ["product", "service"], required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);