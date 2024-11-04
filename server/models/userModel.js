// server/models/userModel.js
import db from './db.js';
import { DataTypes } from 'sequelize';

const User = db.define('User', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sede: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'usuarios',  // Points explicitly to the `usuarios` table
  timestamps: false,
});

export default User;
