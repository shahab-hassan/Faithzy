const mongoose = require("mongoose");

const connectDB = async ()=>{
    let connection = await mongoose.connect(process.env.DB_URI)
    console.log("Connected to Database: " + connection.connection.name);
}

module.exports = connectDB;