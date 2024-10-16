import db from './db.js';

const Ticket = {
  create: (ticketData, callback) => {
    const query = 'INSERT INTO tickets (tipoSolicitud, categoria, subcategoria, estado, usuarioSolicitud, ubicacion, gestorProceso, prioridad, urgencia, horaSolicitud, tiempoEspera, tiempoAbierto, fechaVencimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [ticketData.tipoSolicitud, ticketData.categoria, ticketData.subcategoria, ticketData.estado, ticketData.usuarioSolicitud, ticketData.ubicacion, ticketData.gestorProceso, ticketData.prioridad, ticketData.urgencia, ticketData.horaSolicitud, ticketData.tiempoEspera, ticketData.tiempoAbierto, ticketData.fechaVencimiento], callback);
  },
  findByUser: (userId, callback) => {
    const query = 'SELECT * FROM tickets WHERE usuarioSolicitud = ?';
    db.query(query, [userId], callback);
  },
  update: (ticketData, callback) => {
    const query = 'UPDATE tickets SET estado=?, gestorProceso=?, prioridad=?, urgencia=?, tiempoEspera=?, tiempoAbierto=?, fechaVencimiento=? WHERE id=?';
    db.query(query, [ticketData.estado, ticketData.gestorProceso, ticketData.prioridad, ticketData.urgencia, ticketData.tiempoEspera, ticketData.tiempoAbierto, ticketData.fechaVencimiento, ticketData.id], callback);
  },
  delete: (id, callback) => {
    const query = 'DELETE FROM tickets WHERE id=?';
    db.query(query, [id], callback);
  },
  findAll: (callback) => {
    const query = 'SELECT * FROM tickets';
    db.query(query, [], callback);
  }
};

export default Ticket;
