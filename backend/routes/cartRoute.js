const express = require("express");
const router = express.Router();
const { getCarts, addToCart, removeFromCart, updateCart } = require("../controllers/cartCtrl");
const { authorized } = require("../middlewares/authorization");

router.route("/")
  .get(authorized, getCarts)
  .post(authorized, addToCart)
  .put(authorized, updateCart)
  .delete(authorized, removeFromCart);

module.exports = router;