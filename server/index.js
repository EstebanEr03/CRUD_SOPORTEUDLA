import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

const app = express();
const salt=10;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use(cookieParser());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "usuariossoporte_crud"
});

// CRUD (Create, Read, Update, Delete)
// Crear usuario
app.post("/create", (req, res) => {
    const { nombre, edad, sede, area } = req.body;
    db.query('INSERT INTO usuarios (nombre, edad, sede, area) VALUES (?, ?, ?, ?)', 
        [nombre, edad, sede, area], 
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    );
});

// Leer usuarios
app.get("/empleados", (req, res) => {
    db.query('SELECT * FROM usuarios', (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

// Actualizar usuario
app.put("/update", (req, res) => {
    const { id, nombre, edad, sede, area } = req.body;
    db.query('UPDATE usuarios SET nombre=?, edad=?, sede=?, area=? WHERE id=?', 
        [nombre, edad, sede, area, id], 
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    );
});

// Eliminar usuario
app.delete("/delete/:id", (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id=?', [id], 
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    );
});

app.listen(3001, () => {
    console.log("Corriendo en el puerto 3001");
});
