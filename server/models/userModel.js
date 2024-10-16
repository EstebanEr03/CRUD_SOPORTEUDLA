import db from './db.js';

const User = {
  create: (userData, callback) => {
    const query = 'INSERT INTO usuarios (nombre, edad, sede, area) VALUES (?, ?, ?, ?)';
    db.query(query, [userData.nombre, userData.edad, userData.sede, userData.area], callback);
  },
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM login WHERE email = ?';
    db.query(query, [email], callback);
  },
  update: (userData, callback) => {
    const query = 'UPDATE usuarios SET nombre=?, edad=?, sede=?, area=? WHERE id=?';
    db.query(query, [userData.nombre, userData.edad, userData.sede, userData.area, userData.id], callback);
  },
  delete: (id, callback) => {
    const query = 'DELETE FROM usuarios WHERE id=?';
    db.query(query, [id], callback);
  },
  findAll: (callback) => {
    const query = 'SELECT * FROM usuarios';
    db.query(query, [], callback);
  }
};

export default User;
