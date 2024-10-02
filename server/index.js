//Referenciar Express backend node 
const express = require("express");
const app = express();
const mysql = require ("mysql");


//cors desbloquea para solicitudes
const cors= require("cors");

app.use(cors({
    origin: 'http://localhost:3000',
  }));  

//middle ware que transforma todo a json
app.use(express.json());

//conexión db
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"usuariossoporte_crud"

});

//peticion guardar
app.post("/create",(req,res)=>{
    const nombre = req.body.nombre;
    const edad = req.body.edad;
    const sede = req.body.sede;
    const area = req.body.area;

    db.query('INSERT INTO usuarios(nombre,edad,sede,area) VALUES(?,?,?,?)',[nombre,edad,sede,area],
        (err,result)=>{
            if(err){
                console.log(err);
            }else{
                res.send(result);
            }
        }
    );

});

//peticion Read
app.get("/empleados",(req,res)=>{
    db.query('SELECT * FROM usuarios',
        (err,result)=>{
            if(err){
                console.log(err);
            }else{
                res.send(result);
            }
        }
    );

});

//peticion Modificar

app.put("/update",(req,res)=>{
    const id = req.body.id;
    const nombre = req.body.nombre;
    const edad = req.body.edad;
    const sede = req.body.sede;
    const area = req.body.area;

    db.query('UPDATE usuarios SET nombre=?,edad=?,sede=?,area=? WHERE id=?',[nombre,edad,sede,area,id],
        (err,result)=>{
            if(err){
                console.log(err);
            }else{
                res.send(result);
            }
        }
    );

});

app.delete("/delete/:id",(req,res)=>{
    const id = req.params.id;
    db.query('DELETE FROM usuarios WHERE id=?',id,
        (err,result)=>{
            if(err){
                console.log(err);
            }else{
                res.send(result);
            }
        }
    );

});

app.listen(3001,()=>{
    console.log("Corriendo en el puerto 3001")
})