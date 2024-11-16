// server/models/subcategoryModel.js
import { DataTypes } from 'sequelize';
import db from './db.js';
import Category from './categoryModel.js';

const Subcategory = db.define('Subcategory', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tiempo_estimado: {
    type: DataTypes.INTEGER,
    allowNull: false, // Tiempo estimado en minutos
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id'
    }
  }
}, {
  tableName: 'subcategorias',
  timestamps: false,
});

// Definir la relación uno a muchos entre Category y Subcategory
Category.hasMany(Subcategory, { foreignKey: 'categoria_id', as: 'subcategories' });
Subcategory.belongsTo(Category, { foreignKey: 'categoria_id', as: 'category' });

export default Subcategory;
