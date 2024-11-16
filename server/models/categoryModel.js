// server/models/categoryModel.js
import { DataTypes } from 'sequelize';
import db from './db.js';

const Category = db.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'categorias', // Asegúrate de que coincide con el nombre de la tabla en la base de datos
  timestamps: false,
});

export default Category;
