const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

const {getAllProducts, getRecentlyViewedProducts, addRecentlyViewedProduct, getMySellerProducts, createProduct, getProduct, updateProduct, deleteProduct, getCategoryProducts, getSellerProductsById} = require("../controllers/productCtrl.js");
const {authorized, authorizedRoles} = require("../middlewares/authorization.js");

router.route("/all/")
.get(getAllProducts)

// router.route("/seller/all/")
// .get(getSellerProducts)

router.route("/product/:id")
.get(getProduct)

router.route("/category/all/:categoryName")
.get(getCategoryProducts)


router.route("/profile/myProducts/:id")
.get(getSellerProductsById)

router.route("/seller/myProducts/all/")
.get(authorized, getMySellerProducts)

router.route("/seller/product/new")
.post(authorized, (req, res, next) => {
    upload.fields([{ name: 'productThumbnail', maxCount: 1 }, { name: 'productGallery', maxCount: 5 }])(req, res, function (err) {
      if (err)
        return next(err);
      createProduct(req, res, next);
    });
})

router.route("/seller/product/:id")
.put(authorized, (req, res, next) => {
    upload.fields([{ name: 'productThumbnail', maxCount: 1 }, { name: 'productGallery', maxCount: 5 }])(req, res, function (err) {
      if (err)
        return next(err);
      updateProduct(req, res, next);
    });
  })
.delete(authorized, deleteProduct)

router.route("/user/recentlyViewed/")
.get(authorized, getRecentlyViewedProducts)
.post(authorized, addRecentlyViewedProduct)

module.exports = router;