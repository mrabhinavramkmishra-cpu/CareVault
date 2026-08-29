const mongoose=require("mongoose");
module.exports=mongoose.model("Reminder",new mongoose.Schema({
  patientId:{type:mongoose.Schema.Types.ObjectId,ref:"Patient",required:true},
  doctorId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  type:{type:String,enum:["medicine","appointment"],required:true},
  title:{type:String,required:true,maxlength:160},
  notes:{type:String,maxlength:1000,default:""},
  remindAt:{type:Date,required:true},
  repeat:{type:String,enum:["once","daily"],default:"once"},
  language:{type:String,default:"en"},
  active:{type:Boolean,default:true}
},{timestamps:true}));
