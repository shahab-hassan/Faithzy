const mongoose = require("mongoose");

const connectDB = async ()=>{
    try{
        let connection = await mongoose.connect(process.env.DB_URI)
        console.log("Connected to Database: " + connection.connection.name);
    }
    catch(e){
        console.log(e);
    }
}

module.exports = connectDB;