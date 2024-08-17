const express = require("express");
const router = express.Router();

const adminModel = require("../models/adminModel.js");
const { loginAdmin, addNewAdmin, getAdmins } = require("../controllers/adminCtrl.js");
const { authorizeAdmin } = require("../middlewares/authorization");


router.get("/all", authorizeAdmin, getAdmins);
router.post("/admin/add", authorizeAdmin, addNewAdmin);
router.post("/admin/login", loginAdmin);

router.get('/admin/checkAdminLogin', authorizeAdmin, async (req, res) => {
    const admin = await adminModel.findById(req.admin._id);
    if (!admin){
      res.status(404)
      throw new Error ("Admin not found!");
    }
    return res.status(200).json({ success: true, isLogin: true, admin });
  });


module.exports = router;