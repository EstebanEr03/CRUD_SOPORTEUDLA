import User from '../models/userModel.js';
import db from '../models/db.js'; // Importar la conexión a la base de datos
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = (req, res) => {
  const { nombre, edad, sede, area, email, password } = req.body;

  // Insertar en la tabla usuarios
  User.create({ nombre, edad, sede, area }, (err, result) => {
    if (err) {
      console.log("Error al insertar en usuarios:", err);
      return res.status(500).json({ error: 'Error inserting user' });
    }

    const userId = result.insertId;

    // Encriptar la contraseña antes de insertarla en la tabla login
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: 'Error hashing password' });

      const query = 'INSERT INTO login (user_id, email, password) VALUES (?, ?, ?)';
      db.query(query, [userId, email, hash], (err) => {
        if (err) return res.status(500).json({ error: 'Error inserting login credentials' });
        res.status(200).json({ message: 'User and login created successfully' });
      });
    });
  });
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching user' });
    if (result.length === 0) return res.status(404).json({ error: 'User not found' });

    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error comparing passwords' });
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: result[0].user_id }, 'secret_key', { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    });
  });
};

export const getEmpleados = (req, res) => {
  User.findAll((err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching users' });
    res.status(200).json(result);
  });
};

export const updateEmpleado = (req, res) => {
  const { id, nombre, edad, sede, area } = req.body;
  User.update({ id, nombre, edad, sede, area }, (err) => {
    if (err) return res.status(500).json({ error: 'Error updating user' });
    res.status(200).json({ message: 'User updated successfully' });
  });
};

export const deleteEmpleado = (req, res) => {
  const { id } = req.params;
  User.delete(id, (err) => {
    if (err) return res.status(500).json({ error: 'Error deleting user' });
    res.status(200).json({ message: 'User deleted successfully' });
  });
};
