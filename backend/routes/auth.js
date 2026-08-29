const router=require("express").Router();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");
const {requireAuth,role}=require("../middleware/auth");

const sign=u=>jwt.sign({sub:u._id.toString(),role:u.role},process.env.JWT_SECRET,{expiresIn:"8h"});
const cookieOptions=()=>({httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:8*60*60*1000});

router.post("/login",async(req,res)=>{
  try{
    const {staffId,password}=req.body;
    if(!staffId||!password)return res.status(400).json({message:"Staff ID and password are required"});
    const u=await User.findOne({staffId:String(staffId).trim()});
    if(!u||!u.active)return res.status(401).json({message:"Invalid credentials or inactive account"});
    if(!(await bcrypt.compare(password,u.passwordHash)))return res.status(401).json({message:"Invalid credentials"});
    res.cookie("access_token",sign(u),cookieOptions());
    res.json({user:{id:u._id,name:u.name,staffId:u.staffId,email:u.email,role:u.role}});
  }catch(e){console.error(e);res.status(500).json({message:"Login failed"})}
});

router.post("/logout",(req,res)=>{res.clearCookie("access_token",cookieOptions());res.json({message:"Logged out"})});
router.get("/me",requireAuth,(req,res)=>res.json({user:{id:req.user._id,name:req.user.name,staffId:req.user.staffId,email:req.user.email,role:req.user.role}}));

router.post("/register-doctor",requireAuth,role("admin"),async(req,res)=>{
  try{
    const {name,staffId,email,password}=req.body;
    if(!name||!staffId||!email||!password)return res.status(400).json({message:"Name, staff ID, email and password are required"});
    if(String(password).length<8)return res.status(400).json({message:"Doctor password must contain at least 8 characters"});
    const sid=String(staffId).trim(),em=String(email).trim().toLowerCase();
    if(await User.findOne({$or:[{staffId:sid},{email:em}]}))return res.status(409).json({message:"Staff ID or email is already registered"});
    const doctor=await User.create({name:String(name).trim(),staffId:sid,email:em,passwordHash:await bcrypt.hash(password,12),role:"doctor",active:true});
    res.status(201).json({message:"Doctor registered successfully",doctor:{id:doctor._id,name:doctor.name,staffId:doctor.staffId,email:doctor.email}});
  }catch(e){console.error(e);res.status(500).json({message:"Unable to register doctor"})}
});

router.get("/doctors",requireAuth,role("admin"),async(req,res)=>{
  const doctors=await User.find({role:"doctor"}).select("_id name staffId email active createdAt").sort({createdAt:-1});
  res.json({doctors});
});

router.patch("/doctors/:id/status",requireAuth,role("admin"),async(req,res)=>{
  const doctor=await User.findOne({_id:req.params.id,role:"doctor"});
  if(!doctor)return res.status(404).json({message:"Doctor not found"});
  doctor.active=Boolean(req.body.active);await doctor.save();
  res.json({message:doctor.active?"Doctor activated":"Doctor deactivated"});
});

async function ensureHospitalAdmin(){
  const staffId=String(process.env.ADMIN_STAFF_ID||"").trim();
  const password=process.env.ADMIN_PASSWORD||"";
  if(!staffId||!password){console.warn("ADMIN_STAFF_ID / ADMIN_PASSWORD not configured.");return}
  const email=(process.env.ADMIN_EMAIL||"admin@hospital.local").toLowerCase();
  const name=process.env.ADMIN_NAME||"Hospital Administrator";
  let admin=await User.findOne({staffId});
  if(!admin){
    await User.create({name,staffId,email,passwordHash:await bcrypt.hash(password,12),role:"admin",active:true});
    console.log(`Hospital admin created: staff ID ${staffId}`);
  }else if(admin.role!=="admin"){
    admin.role="admin";admin.active=true;await admin.save();
  }
}
module.exports={router,ensureHospitalAdmin};
