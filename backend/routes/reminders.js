const router=require("express").Router();
const Reminder=require("../models/Reminder");
const Patient=require("../models/Patient");
const {requireAuth}=require("../middleware/auth");
const Audit=require("../models/AuditLog");

async function audit(req,action,id){
  await Audit.create({actor:req.user._id,action,patientId:id,ip:req.ip,userAgent:req.get("user-agent")||""});
}
router.get("/",requireAuth,async(req,res)=>{
  const reminders=await Reminder.find({doctorId:req.user._id,active:true}).sort({remindAt:1}).populate("patientId","_id");
  res.json({reminders});
});
router.post("/",requireAuth,async(req,res)=>{
  try{
    const {patientId,type,title,notes,remindAt,repeat,language}=req.body;
    if(!patientId||!type||!title||!remindAt)return res.status(400).json({message:"Patient, type, title and reminder time are required"});
    if(!["medicine","appointment"].includes(type))return res.status(400).json({message:"Invalid reminder type"});
    const patient=await Patient.findById(patientId);
    if(!patient)return res.status(404).json({message:"Patient not found"});
    const r=await Reminder.create({patientId,doctorId:req.user._id,type,title,notes:notes||"",remindAt:new Date(remindAt),repeat:repeat||"once",language:language||"en"});
    await audit(req,"REMINDER_CREATED",patientId);
    res.status(201).json({reminder:r});
  }catch(e){res.status(400).json({message:"Unable to create reminder"})}
});
router.delete("/:id",requireAuth,async(req,res)=>{
  const r=await Reminder.findOneAndUpdate({_id:req.params.id,doctorId:req.user._id},{active:false},{new:true});
  if(!r)return res.status(404).json({message:"Reminder not found"});
  await audit(req,"REMINDER_CANCELLED",r.patientId);
  res.json({message:"Reminder cancelled"});
});
module.exports=router;
