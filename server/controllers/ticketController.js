import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js';

// Lógica para asignar automáticamente un ticket
const asignarTicket = async (ticketData) => {
  return new Promise((resolve, reject) => {
    // Obtener todos los usuarios con su número de tickets asignados
    User.findAllWithTicketCount((err, users) => {
      if (err) {
        reject('Error al obtener los usuarios');
      } else {
        // Lógica para encontrar el usuario menos cargado (que tiene menos tickets)
        let usuarioMenosCargado = users[0];
        users.forEach(user => {
          if (user.ticketCount < usuarioMenosCargado.ticketCount) {
            usuarioMenosCargado = user;
          }
        });

        // Asignar el ticket al usuario menos cargado
        ticketData.asignadoA = usuarioMenosCargado.id;
        resolve(ticketData);
      }
    });
  });
};

// Crear ticket con asignación automática
export const createTicket = async (req, res) => {
  try {
    const ticketData = req.body;

    // Asignar el ticket a un usuario con la lógica automática
    await asignarTicket(ticketData);
    
    // Crear el ticket
    Ticket.create(ticketData, (err) => {
      if (err) {
        res.status(500).json({ error: 'Error al crear el ticket' });
      } else {
        res.status(200).json({ message: 'Ticket creado y asignado exitosamente' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la asignación del ticket' });
  }
};

// Obtener tickets por usuario
export const getTicketsByUser = (req, res) => {
  const userId = req.params.userId;
  Ticket.findByUser(userId, (err, tickets) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener los tickets' });
    } else {
      res.status(200).json(tickets);
    }
  });
};

// Actualizar ticket
export const updateTicket = (req, res) => {
  Ticket.update(req.body, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error al actualizar el ticket' });
    } else {
      res.status(200).json({ message: 'Ticket actualizado exitosamente' });
    }
  });
};

// Eliminar ticket
export const deleteTicket = (req, res) => {
  const id = req.params.id;
  Ticket.delete(id, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error al eliminar el ticket' });
    } else {
      res.status(200).json({ message: 'Ticket eliminado exitosamente' });
    }
  });
};

// Obtener todos los tickets
export const getAllTickets = (req, res) => {
  Ticket.findAll((err, tickets) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener los tickets' });
    } else {
      res.status(200).json(tickets);
    }
  });
};
