// server/models/ticketModel.js
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
  categoria: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id'
    },
  },
  subcategoria: {
    type: DataTypes.INTEGER,
    references: {
      model: Subcategory,
      key: 'id'
    },
  },
  estado: {
    type: DataTypes.ENUM('En proceso', 'En espera', 'Abierto', 'Resuelto', 'Cerrado'),
    allowNull: false,
    defaultValue: 'Abierto'
  },
  usuario_solicitud: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gestor_proceso: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
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
    type: DataTypes.INTEGER, // en minutos
    allowNull: true,
  },
  tiempo_abierto: {
    type: DataTypes.INTEGER, // en minutos
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
      key: 'id'
    },
    allowNull: true,
  }
}, {
  tableName: 'tickets',
  timestamps: false,
});

// Definir relaciones
Ticket.belongsTo(User, { as: 'solicitante', foreignKey: 'usuario_solicitud' });
Ticket.belongsTo(User, { as: 'gestor', foreignKey: 'gestor_proceso' });
Ticket.belongsTo(User, { as: 'agente', foreignKey: 'asignado_a' });
Ticket.belongsTo(Category, { as: 'categoria_rel', foreignKey: 'categoria' });
Ticket.belongsTo(Subcategory, { as: 'subcategoria_rel', foreignKey: 'subcategoria' });

export default Ticket;
