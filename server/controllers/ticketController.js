// server/controllers/ticketController.js
import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js';
import HistoricoAsignaciones from '../models/historicoAsignacionesModel.js';
import Category from '../models/categoryModel.js'; // Asegúrate de que la ruta es correcta
import Subcategory from '../models/subcategoryModel.js'; // Importamos el modelo de subcategoría para tiempo estimado



// Obtener Tickets Asignados a un Agente
export const getAssignedTickets = async (req, res) => {
  const { user_id } = req.user; // Obtiene el user_id del agente desde el token de autenticación

  try {
    const tickets = await Ticket.findAll({
      where: { asignado_a: user_id, estado: ['Abierto', 'En proceso'] }
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error al obtener los tickets asignados:", error);
    res.status(500).json({ error: 'Error al obtener los tickets asignados' });
  }
};
// Obtener Tickets Creados por el Solicitante
export const getMyTickets = async (req, res) => {
  const { user_id } = req.user; // Usamos el user_id del solicitante desde el token de autenticación

  try {
    const tickets = await Ticket.findAll({
      where: { usuario_solicitud: user_id } // Filtra por el ID del solicitante
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error al obtener los tickets del solicitante:", error);
    res.status(500).json({ error: 'Error al obtener los tickets del solicitante' });
  }
};
// Crear Ticket - Solo accesible por Solicitantes
export const createTicket = async (req, res) => {
  const { tipo_solicitud, categoria, subcategoria, usuario_solicitud, ubicacion, prioridad, urgencia } = req.body;

  try {
    const newTicket = await Ticket.create({
      tipo_solicitud,
      categoria,
      subcategoria,
      usuario_solicitud,
      ubicacion,
      prioridad,
      urgencia,
      estado: 'Abierto',
      hora_solicitud: new Date()
    });
    res.status(201).json({ message: 'Ticket creado exitosamente', ticket: newTicket });
  } catch (error) {
    console.error("Error al crear el ticket:", error);
    res.status(500).json({ error: 'Error al crear el ticket' });
  }
};

// Consultar Tickets - Acceso según rol
export const getTickets = async (req, res) => {
  console.log('Usuario autenticado:', req.user); // Verificar datos del usuario

  const { rol_id, user_id } = req.user;

  try {
    let tickets;

    if (rol_id == '2') { // Gestor
      tickets = await Ticket.findAll({
        include: [
          { model: Category, as: 'categoria_rel', attributes: ['nombre'] }, // Incluir nombre de categoría
          { model: Subcategory, as: 'subcategoria_rel', attributes: ['nombre'] }, // Incluir nombre de subcategoría
          { model: User, as: 'solicitante', attributes: ['nombre'] }, // Incluir nombre del solicitante
        ],
      });
    } else if (rol_id == '3') { // Agente
      tickets = await Ticket.findAll({
        where: { asignado_a: user_id },
        include: [
          { model: Category, as: 'categoria_rel', attributes: ['nombre'] },
          { model: Subcategory, as: 'subcategoria_rel', attributes: ['nombre'] },
          { model: User, as: 'solicitante', attributes: ['nombre'] },
        ],
      });
    } else {
      console.log('El usuario no tiene permiso para obtener tickets.');
      return res.status(403).json({ error: 'No tienes permisos para acceder a los tickets.' });
    }

    console.log('Tickets obtenidos:', tickets);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error al obtener los tickets:', error.message);
    res.status(500).json({ error: 'Error al obtener los tickets' });
  }
};




// Actualizar Ticket - Cambiar estado (solo Agentes)
export const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Contiene todos los datos enviados desde el frontend

  try {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    // Actualizar todos los campos enviados
    await ticket.update(updates);
    res.status(200).json({ message: "Ticket actualizado correctamente", ticket });
  } catch (error) {
    console.error("Error al actualizar el ticket:", error);
    res.status(500).json({ error: "Error al actualizar el ticket" });
  }
};


// Eliminar Ticket - Solo Gestores
export const deleteTicket = async (req, res) => {
  const { id } = req.params;

  try {
    await Ticket.destroy({ where: { id } });
    res.status(200).json({ message: 'Ticket eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar el ticket:", error);
    res.status(500).json({ error: 'Error al eliminar el ticket' });
  }
};

// Asignación Automática de Tickets - Gestión de Carga de Trabajo
export const asignarTicket = async (req, res) => {
  const { ticket_id, motivo_reasignacion } = req.body;

  try {
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

    // Obtener el tiempo estimado de la subcategoría del ticket
    const subcategoria = await Subcategory.findByPk(ticket.subcategoria);
    const tiempoEstimado = subcategoria ? subcategoria.tiempo_estimado : 0;

    // Obtener agentes y su carga de trabajo
    const agentes = await User.findAll({
      where: { rol_id: 3 }, // Rol de Agente
      include: [{
        model: Ticket,
        as: 'assignedTickets',
        where: { estado: ['Abierto', 'En proceso'] },
        required: false
      }]
    });

    // Seleccionar al agente con menor carga
    let agenteSeleccionado = null;
    let menorCarga = Number.MAX_SAFE_INTEGER;

    for (const agente of agentes) {
      const cargaActual = agente.assignedTickets.reduce((acc, t) => acc + t.tiempo_estimado, 0);

      if (cargaActual < menorCarga) {
        menorCarga = cargaActual;
        agenteSeleccionado = agente;
      }
    }

    if (!agenteSeleccionado) {
      return res.status(500).json({ error: 'No hay agentes disponibles para asignación' });
    }

    // Asignar el ticket y registrar en el historial
    ticket.asignado_a = agenteSeleccionado.id;
    ticket.tiempo_estimado = tiempoEstimado;
    await ticket.save();

    await HistoricoAsignaciones.create({
      ticket_id: ticket.id,
      agente_id: agenteSeleccionado.id,
      fecha_asignacion: new Date(),
      estado_inicial: ticket.estado,
      estado_final: 'Asignado',
      motivo_reasignacion: motivo_reasignacion || null,
    });

    res.status(200).json({ message: 'Ticket asignado exitosamente', agente: agenteSeleccionado });
  } catch (error) {
    console.error("Error en la asignación automática:", error);
    res.status(500).json({ error: 'Error en la asignación automática' });
  }
};

// Obtener un ticket por su ID
export const getTicketById = async (req, res) => {
  const { id } = req.params; // Obtener el ID desde los parámetros de la ruta

  try {
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: Category, as: 'categoria_rel', attributes: ['nombre'] }, // Incluir categoría relacionada
        { model: Subcategory, as: 'subcategoria_rel', attributes: ['nombre'] }, // Incluir subcategoría relacionada
        { model: User, as: 'solicitante', attributes: ['nombre'] }, // Incluir solicitante
      ],
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.status(200).json(ticket); // Enviar el ticket encontrado
  } catch (error) {
    console.error('Error al obtener el ticket por ID:', error);
    res.status(500).json({ error: 'Error al obtener el ticket' });
  }
};