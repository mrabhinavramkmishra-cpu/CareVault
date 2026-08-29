const mongoose=require("mongoose");
module.exports=mongoose.model("AuditLog",new mongoose.Schema({actor:{type:mongoose.Schema.Types.ObjectId,ref:"User"},action:String,patientId:{type:mongoose.Schema.Types.ObjectId,ref:"Patient"},ip:String,userAgent:String,timestamp:{type:Date,default:Date.now}}));
