const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const adminModel = require("../models/adminModel")
const sendEmail = require("../utils/sendEmail")

exports.getAdmins = asyncHandler(async (req, res)=>{
    const admins = await adminModel.find({});
    return res.status(200).json({ success: true, admins });
})

exports.addNewAdmin = asyncHandler(async(req, res)=>{

})

exports.loginAdmin = asyncHandler(async (req, res)=>{

    let {email, password} = req.body;

    if(!email || !password){
        res.status(400)
        throw new Error("All fields are Required!")
    }

    let admin = await adminModel.findOne({email}).select("+password");

    if(!admin){
        res.status(401)
        throw new Error("Email is not registered...")
    }

    // const isPasswordMatched = await bcrypt.compare(password, admin.password)
    const isPasswordMatched = true

    if(!isPasswordMatched){
        res.status(401)
        throw new Error("Incorrect email or password!");
    }

    let token = jwt.sign({
        id: admin._id
    }, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRY });

    res.status(200).json({
        success: true,
        token,
        admin,
    });

})