const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const { authorized, authorizedRoles, authorizeAdmin } = require("../middlewares/authorization");

const { getAllSellers, getSeller, createSeller, updateSeller, deleteSeller, upgradeSellerPlan, cancelSellerPlan } = require("../controllers/sellerCtrl");

router.get("/all/", authorizeAdmin, getAllSellers);

// router.get('/seller/user/:userId', authorized, getSellerByUserId);

router.route("/profile/:id").get(getSeller);

router.route("/seller/:id")
  .get(authorized, getSeller)
  .put(authorized, (req, res, next) => {
    upload.single('profileImage')(req, res, function (err) {
      if (err)
        return next(err);
      updateSeller(req, res, next);
    });
  })
  .delete(authorized, authorizedRoles("seller"), deleteSeller);

router.post("/seller/new/", authorized, (req, res, next) => {
  upload.single('profileImage')(req, res, function (err) {
    if (err)
      return next(err);
    createSeller(req, res, next);
  });
});


router.put('/plan/upgrade/:id', authorized, upgradeSellerPlan);

router.put('/plan/cancel/:id', authorized, cancelSellerPlan);



module.exports = router;
