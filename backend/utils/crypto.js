const crypto=require("crypto");
const KEY=crypto.createHash("sha256").update(process.env.JWT_SECRET).digest();
function encrypt(value){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv("aes-256-gcm",KEY,iv),data=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);return [iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),data.toString("base64url")].join(".")}
function decrypt(payload){try{const [iv,tag,data]=payload.split("."),d=crypto.createDecipheriv("aes-256-gcm",KEY,Buffer.from(iv,"base64url"));d.setAuthTag(Buffer.from(tag,"base64url"));return Buffer.concat([d.update(Buffer.from(data,"base64url")),d.final()]).toString("utf8")}catch{return null}}
module.exports={encrypt,decrypt};
