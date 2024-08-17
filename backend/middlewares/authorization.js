const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const authModel = require("../models/userModel");
const adminModel = require("../models/adminModel");


exports.authorized = asyncHandler(async (req, res, next) => {
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(401);
        throw new Error("Please login to access this resource!");
    }
    
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401);
        throw new Error("Please login to access this resource!");
    }
    
    const decode = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    req.user = await authModel.findById(decode.id);

    if (!req.user) {
        res.status(401);
        throw new Error("User not found, please login!");
    }

    next();
});

exports.authorizeAdmin = asyncHandler(async (req, res, next) => {
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(401);
        throw new Error("Please login to access this resource!");
    }
    
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401);
        throw new Error("Please login to access this resource!");
    }
    
    const decode = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    req.admin = await adminModel.findById(decode.id);

    if (!req.admin) {
        res.status(401);
        throw new Error("User not found, please login!");
    }

    next();
});

exports.authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403)
            throw new Error(`${req.user.role} is not allowed to access this Resource`);
        }
        next();
    }
}
