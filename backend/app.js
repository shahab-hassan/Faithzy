const express = require("express");
const cors = require("cors");
const passport = require('passport');
const session = require("express-session");
const errorHandler = require("./middlewares/errorHandlerMW");
const path = require('path');

require("dotenv").config({ path: "./config/.env" });
require("./config/passport.js");

const { app, server } = require("./config/socket.js");

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
// app.use(cors())

app.use(session({
  secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

app.use("/api/v1/auth/", require("./routes/userRoute"));
app.use("/api/v1/products", require("./routes/productRoute"));
app.use("/api/v1/sellers", require("./routes/sellerRoute"));
app.use("/api/v1/services", require("./routes/serviceRoute"));
app.use("/api/v1/categories", require("./routes/categoryRoute.js"));
app.use("/api/v1/wishlists", require("./routes/wishlistRoute.js"));
app.use("/api/v1/carts", require("./routes/cartRoute.js"));
app.use("/api/v1/tradeleads", require("./routes/tradeleadRoute.js"));
app.use("/api/v1/orders", require("./routes/orderRoute.js"));
app.use("/api/v1/chats", require("./routes/chatRoute.js"));
app.use("/api/v1/admins", require("./routes/adminRoute.js"));

app.use(errorHandler);

module.exports = {app, server};