// server/models/categoryModel.js
import { DataTypes } from 'sequelize';
import db from './db.js';

const Category = db.define('Category', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'categorias',
  timestamps: false,
});

export default Category;
