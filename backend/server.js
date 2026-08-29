const path=require("path"); require("dotenv").config({path:path.join(__dirname,".env")});
const express=require("express"),mongoose=require("mongoose"),helmet=require("helmet"),cors=require("cors"),cookieParser=require("cookie-parser"),rateLimit=require("express-rate-limit");
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32){console.error("Set JWT_SECRET to at least 32 characters in backend/.env");process.exit(1)}
if(!process.env.MONGO_URI){console.error("Set MONGO_URI in backend/.env");process.exit(1)}
const {router:auth,ensureHospitalAdmin}=require("./routes/auth");
const patients=require("./routes/patients"),audit=require("./routes/audit"),reminders=require("./routes/reminders");
const app=express(),PORT=process.env.PORT||5000;
app.disable("x-powered-by");app.use(helmet());
app.use(cors({origin:process.env.CLIENT_ORIGIN||"http://localhost:5500",credentials:true}));
app.use(express.json({limit:"1mb"}));app.use(cookieParser());

// Serve the frontend from the same Express server. No Python/Live Server needed.
app.use(express.static(path.join(__dirname,"..","frontend")));
app.use("/api/auth",rateLimit({windowMs:15*60*1000,limit:50,standardHeaders:true,legacyHeaders:false}));
app.get("/api/health",(req,res)=>res.json({ok:true,service:"CareVault"}));
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"..","frontend","index.html")));
app.use("/api/auth",auth);app.use("/api/patients",patients);app.use("/api/audit",audit);app.use("/api/reminders",reminders);
mongoose.connect(process.env.MONGO_URI).then(async()=>{await ensureHospitalAdmin();app.listen(PORT,()=>{console.log(`CareVault running on http://localhost:${PORT}`);console.log(`Frontend: http://localhost:${PORT}`);console.log(`API health: http://localhost:${PORT}/api/health`)})}).catch(e=>{console.error("MongoDB connection failed:",e.message);process.exit(1)});
