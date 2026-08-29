const jwt=require("jsonwebtoken"),User=require("../models/User");
async function requireAuth(req,res,next){try{const token=req.cookies.access_token||(req.headers.authorization?.startsWith("Bearer ")?req.headers.authorization.slice(7):null);if(!token)return res.status(401).json({message:"Authentication required"});const p=jwt.verify(token,process.env.JWT_SECRET),u=await User.findById(p.sub).select("_id name staffId email role active");if(!u||!u.active)return res.status(401).json({message:"Account unavailable"});req.user=u;next()}catch{return res.status(401).json({message:"Invalid or expired session"})}}
function role(...roles){return(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:"Permission denied"})}
module.exports={requireAuth,role};
