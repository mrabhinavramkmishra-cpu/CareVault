const router=require("express").Router(),Audit=require("../models/AuditLog"),{requireAuth,role}=require("../middleware/auth");
router.get("/",requireAuth,role("admin"),async(req,res)=>res.json({logs:await Audit.find().sort({timestamp:-1}).limit(200).populate("actor","name email").populate("patientId","_id")}));
module.exports=router;
