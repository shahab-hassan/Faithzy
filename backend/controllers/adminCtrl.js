const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const adminModel = require("../models/adminModel")

exports.getAdmins = asyncHandler(async (req, res) => {
    const admins = await adminModel.find({ email: { $ne: "admin@gmail.com" } }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, admins });
});


exports.addNewAdmin = asyncHandler(async (req, res) => {
    const { email, name, password, role, access } = req.body;

    // Check if all required fields are provided
    if (!email || !name || !password || !role) {
        res.status(400);
        throw new Error("All fields are required!");
    }

    // Check if the email already exists
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
        res.status(400);
        throw new Error("Email already exists!");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin
    const newAdmin = await adminModel.create({
        email,
        name,
        password: hashedPassword,
        role,
        access: role === 'Editor' ? access : undefined
    });

    res.status(201).json({
        success: true,
        admin: newAdmin
    });
});

exports.updateAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, name, role, access, password } = req.body;


    let admin = await adminModel.findById(id);
    if (!admin) {
        res.status(404);
        throw new Error("Admin not found!");
    }

    admin.email = email || admin.email;
    admin.name = name || admin.name;
    admin.role = role || admin.role;
    admin.access = role === 'Editor' ? access : undefined;

    if (password) {
        admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    res.status(200).json({
        success: true,
        admin
    });
});

exports.loginAdmin = asyncHandler(async (req, res) => {

    let { email, password } = req.body;

    if (!email || !password) {
        res.status(400)
        throw new Error("All fields are Required!")
    }

    let admin = await adminModel.findOne({ email }).select("+password");

    if (!admin) {
        res.status(401)
        throw new Error("Email is not registered...")
    }

    const isPasswordMatched = await bcrypt.compare(password, admin.password)

    if (!isPasswordMatched) {
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

exports.deleteAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ success: false, error: "Admin not found" });
        }

        await adminModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to delete admin" });
    }
});