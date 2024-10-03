const {server} = require("./app");
const connectDB = require("./config/database");


// Uncaught Exception:
process.on("uncaughtException", (err)=>{
    console.log("Error: ",err.message);
    console.log("Shutting down server due to uncaught Exception");
    server.close(()=>{
        process.exit(1);
    });
})

// Databse Connection:
connectDB();


// Listening to server:
server.listen(process.env.PORT, ()=>{
    console.log("Server is listening at PORT:", process.env.PORT)
})


// Unhandled Promise rejection:
process.on("unhandledRejection", (err)=>{
    console.log("Error", err.message);
    console.log("Shutting down server due to unhandled promise rejection");
    server.close(()=>{
        process.exit(1);
    });
})