const mongoose = require("mongoose")

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB is connected..")
    }catch(errro){
        console.log("Message is :",error);
    }
}
module.exports = connectDB;