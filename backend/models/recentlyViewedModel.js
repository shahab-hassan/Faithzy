const mongoose = require("mongoose");

const recentlyViewedSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    viewedProducts: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Product"
        }
    ],
    viewedServices: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Service"
        }
    ]
})


module.exports = mongoose.model("RecentlyViewed", recentlyViewedSchema);