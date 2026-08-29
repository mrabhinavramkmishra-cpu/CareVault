const mongoose=require("mongoose");
module.exports=mongoose.model("Patient",new mongoose.Schema({encrypted:{type:String,required:true},createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}},{timestamps:true}));
