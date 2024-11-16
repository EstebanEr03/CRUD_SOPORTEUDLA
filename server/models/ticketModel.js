import { DataTypes } from 'sequelize';
import db from './db.js';
import User from './userModel.js';
import Category from './categoryModel.js';
import Subcategory from './subcategoryModel.js';

const Ticket = db.define('Ticket', {
  tipo_solicitud: {
    type: DataTypes.ENUM('Todos', 'Incidentes', 'Cambios', 'Problemas', 'Solicitudes'),
    allowNull: false,
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id',
    },
    allowNull: true,
  },
  subcategoria_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Subcategory,
      key: 'id',
    },
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('En proceso', 'En espera', 'Abierto', 'Resuelto', 'Cerrado'),
    allowNull: false,
    defaultValue: 'Abierto',
  },
  id_solicitante: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  id_gestor: { // Cambiado de gestor_proceso a id_gestor
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: true,
  },
  prioridad: {
    type: DataTypes.ENUM('Critico', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'),
    allowNull: false,
  },
  urgencia: {
    type: DataTypes.ENUM('Alta', 'Media', 'Baja', 'Muy Baja'),
    allowNull: false,
  },
  hora_solicitud: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  tiempo_espera: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tiempo_abierto: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fecha_vencimiento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  asignado_a: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: true,
  },
}, {
  tableName: 'tickets',
  timestamps: false,
});

// Relaciones actualizadas
Ticket.belongsTo(User, { as: 'solicitante', foreignKey: 'id_solicitante' });
Ticket.belongsTo(User, { as: 'gestor', foreignKey: 'id_gestor' }); // Actualizado
Ticket.belongsTo(User, { as: 'agente', foreignKey: 'asignado_a' });
Ticket.belongsTo(Category, { as: 'categoria_rel', foreignKey: 'categoria_id' });
Ticket.belongsTo(Subcategory, { as: 'subcategoria_rel', foreignKey: 'subcategoria_id' });

export default Ticket;
