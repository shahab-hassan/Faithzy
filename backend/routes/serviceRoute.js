const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

const {getAllServices, getRecentlyViewedServices, addRecentlyViewedService, getMySellerServices, createService, getService, updateService, deleteService, getCategoryServices, getSellerServicesById} = require("../controllers/serviceCtrl.js");
const {authorized, authorizedRoles} = require("../middlewares/authorization")

router.route("/all/")
.get(getAllServices)

// router.route("/seller/all/")
// .get(getSellerServices)

router.route("/service/:id")
.get(getService)

router.route("/category/all/:categoryName")
.get(getCategoryServices)

router.route("/profile/myServices/:id")
.get(getSellerServicesById)

router.route("/seller/myServices/all/")
.get(authorized, authorizedRoles("seller"), getMySellerServices)

router.route("/seller/service/new")
.post(authorized, authorizedRoles("seller"), (req, res, next) => {
    upload.array('serviceImages', 5)(req, res, function (err) {
      if (err)
        return next(err);
      createService(req, res, next);
    });
  })

router.route("/seller/service/:id")
.put(authorized, authorizedRoles("seller"), (req, res, next) => {
    upload.array('serviceImages', 5)(req, res, function (err) {
      if (err)
        return next(err);
      updateService(req, res, next);
    });
  })
.delete(authorized, authorizedRoles("seller"), deleteService)

router.route("/user/recentlyViewed/")
.get(authorized, getRecentlyViewedServices)
.post(authorized, addRecentlyViewedService)

module.exports = router;