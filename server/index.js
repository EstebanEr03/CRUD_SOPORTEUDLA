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
// Crear usuario y registrar// Crear usuario y registrar
app.post("/register", (req, res) => {
  const { nombre, edad, sede, area, email, password } = req.body;
  console.log(req.body);  // Verifica los datos que estás recibiendo

  // Primero insertamos en la tabla usuarios
  const insertUserSql = 'INSERT INTO usuarios (nombre, edad, sede, area) VALUES (?, ?, ?, ?)';
  db.query(insertUserSql, [nombre, edad, sede, area], (err, result) => {
      if (err) {
          console.log("Error al insertar en usuarios:", err);
          return res.status(500).json({ error: 'Error inserting user' });
      }

      const userId = result.insertId;  // ID del usuario recién insertado
      console.log("Usuario insertado con ID:", userId);

      // Encriptamos la contraseña antes de insertarla en la tabla login
      bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
              return res.status(500).json({ error: 'Error hashing password' });
          }

          // Luego insertamos las credenciales en la tabla login
          const insertLoginSql = 'INSERT INTO login (user_id, email, password) VALUES (?, ?, ?)';
          db.query(insertLoginSql, [userId, email, hash], (err, result) => {
              if (err) {
                  console.log("Error al insertar en login:", err);
                  return res.status(500).json({ error: 'Error inserting login credentials' });
              }

              res.status(200).json({ message: 'User and login created successfully' });
          });
      });
  });
});


//login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    // Buscamos el email en la tabla login
    const findUserSql = 'SELECT * FROM login WHERE email = ?';
    db.query(findUserSql, [email], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error fetching user' });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Comparamos la contraseña ingresada con la encriptada en la base de datos
      bcrypt.compare(password, result[0].password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Error comparing passwords' });
        }
  
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
  
        // Aquí puedes generar un token JWT si lo deseas, por ahora devolvemos un éxito simple
        res.status(200).json({ message: 'Login successful' });
      });
    });
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
