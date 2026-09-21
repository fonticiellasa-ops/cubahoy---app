const express=require("express");
const Database=require("better-sqlite3");
const path=require("path");
const app=express();
const PORT=process.env.PORT||3000;
const db=new Database("cubahoy.db");
db.exec(`CREATE TABLE IF NOT EXISTS news(
id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,content TEXT NOT NULL,
category TEXT DEFAULT 'Cuba',image TEXT DEFAULT '',breaking INTEGER DEFAULT 0,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
if(db.prepare("SELECT COUNT(*) n FROM news").get().n===0)
 db.prepare("INSERT INTO news(title,content,category,breaking) VALUES(?,?,?,?)")
 .run("Bienvenidos a CubaHoy","Esta es la primera publicación de demostración de la aplicación CubaHoy.","Cuba",1);
app.use(express.json({limit:"2mb"})); app.use(express.urlencoded({extended:true}));
const USER=process.env.ADMIN_USER||"admin", PASS=process.env.ADMIN_PASSWORD||"cubahoy-demo", TOKEN=process.env.ADMIN_TOKEN||"cubahoy-demo-token";
function auth(req,res,next){if(req.headers.authorization==="Bearer "+TOKEN)return next();res.status(401).json({error:"No autorizado"});}
app.get("/api/news",(req,res)=>res.json(db.prepare("SELECT * FROM news ORDER BY created_at DESC,id DESC").all()));
app.post("/api/login",(req,res)=>{if(req.body.user===USER&&req.body.password===PASS)return res.json({token:TOKEN});res.status(401).json({error:"Usuario o contraseña incorrectos"});});
app.post("/api/news",auth,(req,res)=>{let {title,content,category,image,breaking}=req.body;if(!title||!content)return res.status(400).json({error:"Título y contenido son obligatorios"});let x=db.prepare("INSERT INTO news(title,content,category,image,breaking) VALUES(?,?,?,?,?)").run(title,content,category||"Cuba",image||"",breaking?1:0);res.json(db.prepare("SELECT * FROM news WHERE id=?").get(x.lastInsertRowid));});
app.put("/api/news/:id",auth,(req,res)=>{let {title,content,category,image,breaking}=req.body;let x=db.prepare("UPDATE news SET title=?,content=?,category=?,image=?,breaking=? WHERE id=?").run(title,content,category||"Cuba",image||"",breaking?1:0,req.params.id);if(!x.changes)return res.status(404).json({error:"Noticia no encontrada"});res.json({ok:true});});
app.delete("/api/news/:id",auth,(req,res)=>{db.prepare("DELETE FROM news WHERE id=?").run(req.params.id);res.json({ok:true});});
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"admin.html")));
app.use(express.static(__dirname));
app.listen(PORT,"0.0.0.0",()=>console.log("CubaHoy funcionando en puerto "+PORT));
