const express = require("express");
const router = express.Router();

const {
    getAllCategories,
    getAllProductCategories,
    getAllServiceCategories,
    getProductCategory,
    getServiceCategory,
    addCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryCtrl");

router.get("/all", getAllCategories);
router.get("/product/all", getAllProductCategories);
router.get("/service/all", getAllServiceCategories);

router.get("/category/product/:id", getProductCategory);
router.get("/category/service/:id", getServiceCategory);

router.post("/category/new", addCategory);
router.put("/category/:id", updateCategory);
router.delete("/category/:id", deleteCategory);

module.exports = router;
