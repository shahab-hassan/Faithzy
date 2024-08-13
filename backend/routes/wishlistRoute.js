const express = require("express");
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistCtrl");
const { authorized } = require("../middlewares/authorization");

router.route("/")
  .get(authorized, getWishlist)
  .post(authorized, addToWishlist)
  .delete(authorized, removeFromWishlist);

module.exports = router;