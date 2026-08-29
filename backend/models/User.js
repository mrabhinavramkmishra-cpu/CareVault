const mongoose=require("mongoose");
module.exports=mongoose.model("User",new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:100},
  staffId:{type:String,required:true,unique:true,trim:true},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  passwordHash:{type:String,required:true},
  role:{type:String,enum:["doctor","admin"],default:"doctor"},
  active:{type:Boolean,default:true}
},{timestamps:true}));
