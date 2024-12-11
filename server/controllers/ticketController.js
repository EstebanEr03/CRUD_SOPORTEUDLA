// server/controllers/ticketController.js
import { Op } from 'sequelize';
import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js';
import HistoricoAsignaciones from '../models/historicoAsignacionesModel.js';
import Category from '../models/categoryModel.js';
import Subcategory from '../models/subcategoryModel.js';

// Obtener Tickets Asignados a un Agente
export const getAssignedTickets = async (req, res) => {
  const { id } = req.user; // ID del agente logueado

  try {
    const tickets = await Ticket.findAll({
      where: { asignado_a: id },
      include: [
        { model: User, as: 'solicitante', attributes: ['nombre'] },
        { model: Category, as: 'categoria_rel', attributes: ['nombre'] },
        { model: Subcategory, as: 'subcategoria_rel', attributes: ['nombre'] },
      ],
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error al obtener los tickets asignados:", error);
    res.status(500).json({ error: "Error al obtener los tickets asignados" });
  }
};


// Obtener Tickets Creados por el Solicitante
export const getMyTickets = async (req, res) => {
  try {
    const { id: user_id } = req.user; // Obtiene el ID del usuario autenticado
    if (!user_id) {
      return res.status(400).json({ error: 'No se encontró el ID del solicitante.' });
    }

    const tickets = await Ticket.findAll({
      where: { id_solicitante: user_id }, // Filtra por el ID del solicitante
      include: [
        { model: Category, as: 'categoria_rel', attributes: ['nombre'] },
        { model: Subcategory, as: 'subcategoria_rel', attributes: ['nombre'] },
        { model: User, as: 'agente', attributes: ['nombre'] },
      ],
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error al obtener los tickets del solicitante:', error.message);
    res.status(500).json({ error: 'Error al obtener los tickets del solicitante' });
  }
};

// Crear Ticket - Solo accesible por Solicitantes
export const createTicket = async (req, res) => {
  console.log("Datos recibidos para crear el ticket:", req.body);

  const {
    tipo_solicitud,
    categoria_id,
    subcategoria_id,
    id_solicitante,
    ubicacion,
    prioridad,
    urgencia,
    fecha_vencimiento,
    id_gestor,
    asignado_a,
    estado,
  } = req.body;

  try {
    const agente = await User.findOne({ where: { id: asignado_a, rol_id: 3 } });
    if (!agente) {
      console.error("Error: El agente asignado no tiene el rol adecuado.", { asignado_a });
      return res.status(400).json({ error: "El agente asignado no es válido" });
    }

    const ahora = new Date(); // Momento actual
    const horaSolicitud = ahora;

    // Crear el ticket con los tiempos calculados
    const newTicket = await Ticket.create({
      tipo_solicitud,
      categoria_id,
      subcategoria_id,
      id_solicitante,
      ubicacion,
      prioridad,
      urgencia,
      estado: estado || "Abierto", // Por defecto, se marca como Abierto
      hora_solicitud: horaSolicitud,
      ultimo_cambio_estado: ahora, // Inicializa con la hora de creación
      fecha_vencimiento,
      id_gestor,
      asignado_a,
      tiempo_espera: estado === 'En espera' ? 0 : null,
      tiempo_abierto: estado === 'Abierto' ? 0 : null,
      tiempo_estimado: req.body.tiempo_estimado || null, // Asegúrate de pasar este campo
    });

    // Registrar en la tabla HistoricoAsignaciones
    await HistoricoAsignaciones.create({
      ticket_id: newTicket.id,
      agente_id: asignado_a,
      fecha_asignacion: ahora,
      estado_inicial: "Abierto", // Siempre inicia como Abierto
      estado_final: estado || "Abierto",
      motivo_reasignacion: null, // No hay reasignación al momento de creación
    });

    res.status(201).json({ message: "Ticket creado correctamente", ticket: newTicket });
  } catch (error) {
    console.error("Error al crear el ticket:", error);
    res.status(500).json({ error: "Error al crear el ticket" });
  }
};







// Consultar Tickets - Acceso según rol
export const getTickets = async (req, res) => {
  const { rol_id, user_id } = req.user;

  try {
    let tickets;

    if (rol_id == '2') { // Gestor
      tickets = await Ticket.findAll({
        include: [
          { model: Category, as: 'categoria_rel', attributes: ['nombre'] },
          { model: Subcategory, as: 'subcategoria_rel', attributes: ['nombre'] },
          { model: User, as: 'solicitante', attributes: ['id', 'nombre'] },
          { model: User, as: 'gestor', attributes: ['id', 'nombre'] },
          { model: User, as: 'agente', attributes: ['id', 'nombre'] },
        ],
      });
    } else if (rol_id == '3') { // Agente
      tickets = await Ticket.findAll({
        where: { asignado_a: user_id },
        include: [
          { model: Category, as: 'categoria_rel', attributes: ['nombre'] },
          { model: Subcategory, as: 'subcategoria_rel', attributes: ['nombre'] },
          { model: User, as: 'solicitante', attributes: ['id', 'nombre'] },
          { model: User, as: 'gestor', attributes: ['id', 'nombre'] },
          { model: User, as: 'agente', attributes: ['id', 'nombre'] },
        ],
      });
    } else {
      return res.status(403).json({ error: 'No tienes permisos para acceder a los tickets.' });
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error al obtener los tickets:', error.message);
    res.status(500).json({ error: 'Error al obtener los tickets' });
  }
};

// Actualizar Ticket - Cambiar estado (solo Agentes)
// controllers/ticketController.js
// server/controllers/ticketController.js
export const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { estado, motivo_reasignacion, solucion } = req.body; // Agregar 'solucion' al body

  try {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    const ahora = new Date();
    const ultimoCambio = new Date(ticket.ultimo_cambio_estado || ticket.hora_solicitud);
    const tiempoTranscurrido = Math.floor((ahora - ultimoCambio) / (1000 * 60)); // Tiempo en minutos

    let tiempoEspera = ticket.tiempo_espera || 0;
    let tiempoAbierto = ticket.tiempo_abierto || 0;

    const estadoInicial = ticket.estado; // Obtener estado actual

    // Sumar tiempo transcurrido según el estado inicial
    if (estadoInicial === "En espera") {
      tiempoEspera += tiempoTranscurrido;
    } else if (estadoInicial === "Abierto") {
      tiempoAbierto += tiempoTranscurrido;
    }

    // Actualizar el ticket con los nuevos datos
    await ticket.update({
      estado,
      ultimo_cambio_estado: ahora,
      tiempo_espera: tiempoEspera,
      tiempo_abierto: tiempoAbierto,
      solucion: solucion || ticket.solucion, // Actualizar la solución solo si se envía
    });

    // Registrar en el historial
    await HistoricoAsignaciones.create({
      ticket_id: ticket.id,
      agente_id: ticket.asignado_a,
      fecha_asignacion: ahora,
      estado_inicial: estadoInicial,
      estado_final: estado,
      motivo_reasignacion: motivo_reasignacion || null,
    });

    res.status(200).json({ message: "Estado y solución del ticket actualizados correctamente", ticket });
  } catch (error) {
    console.error("Error al actualizar el estado del ticket:", error);
    res.status(500).json({ error: "Error al actualizar el estado del ticket" });
  }
};
// Eliminar Ticket - Solo Gestores
export const deleteTicket = async (req, res) => {
  const { id } = req.params;

  try {
    // Primero elimina los registros relacionados en HistoricoAsignaciones
    await HistoricoAsignaciones.destroy({
      where: { ticket_id: id },
    });

    // Luego elimina el ticket
    const ticketDeleted = await Ticket.destroy({
      where: { id },
    });

    if (!ticketDeleted) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

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

    const subcategoria = await Subcategory.findByPk(ticket.subcategoria_id);
    const tiempoEstimado = subcategoria ? subcategoria.tiempo_estimado : 0;

    const agentes = await User.findAll({
      where: { rol_id: 3 }, // Solo agentes
      include: [
        {
          model: Ticket,
          as: 'assignedTickets',
          where: { estado: ['Abierto', 'En proceso'] },
          required: false, // Incluir agentes sin tickets
        },
      ],
    });
    
    console.log('Agentes disponibles:', agentes);
    
    let menorCarga = Number.MAX_SAFE_INTEGER;
    let agenteSeleccionado = null;

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

    ticket.asignado_a = agenteSeleccionado.id;
    ticket.tiempo_estimado = tiempoEstimado;
    await ticket.save();

    await HistoricoAsignaciones.create({
      ticket_id: ticket.id,
      agente_id: agenteSeleccionado.id,
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
  const { id } = req.params;

  try {
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: Category, as: 'categoria_rel', attributes: ['nombre'] },
        { model: Subcategory, as: 'subcategoria_rel', attributes: ['nombre'] },
        { model: User, as: 'solicitante', attributes: ['nombre'] },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error al obtener el ticket por ID:', error);
    res.status(500).json({ error: 'Error al obtener el ticket' });
  }
};

// Asignación automática y creación de ticket
// Asignación automática y creación de ticket mejorada
// Asignación automática y creación de ticket mejorada con rotación cíclica
let ultimaAsignacion = null; // Variable global para rastrear el último agente asignado

export const automaticTickets = async (req, res) => {
  const {
    tipo_solicitud,
    categoria_id,
    subcategoria_id,
    ubicacion,
    prioridad,
    urgencia,
    fecha_vencimiento,
  } = req.body;

  console.log("Datos recibidos para crear ticket automáticamente:", req.body);

  const id_solicitante = req.user?.id;

  if (!id_solicitante) {
    return res.status(401).json({ error: "No se encontró el ID del solicitante. Verifica tu sesión." });
  }

  try {
    // Validación de campos obligatorios
    if (!tipo_solicitud || !prioridad || !urgencia) {
      return res.status(400).json({ error: "Faltan datos obligatorios para crear el ticket" });
    }

    // Obtener categoría y subcategoría si existen
    const subcategoria = subcategoria_id ? await Subcategory.findByPk(subcategoria_id) : null;
    const categoria = categoria_id ? await Category.findByPk(categoria_id) : null;

    if (!subcategoria && !categoria) {
      return res.status(400).json({ error: "Categoría o subcategoría no válidas" });
    }

    // Calcular tiempo estimado
    const tiempoEstimado = subcategoria?.tiempo_estimado || categoria?.tiempo_estimado || 30;

    // Obtener agentes disponibles
    const agentes = await User.findAll({
      where: { rol_id: 3 },
      include: [
        {
          model: Ticket,
          as: "assignedTickets",
          where: { estado: ["Abierto", "En proceso"] },
          required: false,
        },
        {
          model: HistoricoAsignaciones,
          as: "historial",
          required: false,
        },
      ],
    });

    if (!agentes || agentes.length === 0) {
      return res.status(500).json({ error: "No hay agentes disponibles para asignar" });
    }

    // Paso 1: Priorizar agentes sin carga
    const agentesSinCarga = agentes.filter(
      (agente) => !agente.assignedTickets || agente.assignedTickets.length === 0
    );

    let mejorAgente;

    if (agentesSinCarga.length > 0) {
      // Rotación entre agentes sin carga
      if (ultimaAsignacion) {
        const indiceUltimaAsignacion = agentesSinCarga.findIndex(
          (agente) => agente.id === ultimaAsignacion
        );
        const siguienteIndice =
          (indiceUltimaAsignacion + 1) % agentesSinCarga.length;
        mejorAgente = agentesSinCarga[siguienteIndice];
      } else {
        mejorAgente = agentesSinCarga[0];
      }
    } else {
      // Paso 2: Agentes con carga - calcular carga ponderada
      const agentesOrdenados = agentes.map((agente) => {
        const cargaActual = agente.assignedTickets.reduce(
          (acc, t) => acc + t.tiempo_estimado,
          0
        );
        const ticketsAsignados = agente.assignedTickets.length;

        // Filtrar tickets resueltos en el historial
        const ticketsResueltos = agente.historial
          ? agente.historial.filter((h) => h.estado_final === "Resuelto").length
          : 0;

        // Fórmula de carga ponderada
        const eficiencia = ticketsResueltos || 1; // Evitar división por 0
        const pesoPrioridad = prioridad === "Critico" ? 3 : prioridad === "Alto" ? 2 : 1;
        const pesoUrgencia = urgencia === "Alta" ? 3 : urgencia === "Media" ? 2 : 1;

        const cargaPonderada =
          (cargaActual + ticketsAsignados * 10) / eficiencia +
          pesoPrioridad +
          pesoUrgencia;

        // Imprimir variables clave para depuración
        // Imprimir variables clave para depuración
        console.log(`Agente: ${agente.nombre}`);
        console.log(`  Carga Actual: ${cargaActual}`);
        console.log(`  Tickets Asignados: ${ticketsAsignados}`);
        console.log(`  Tickets Resueltos: ${ticketsResueltos}`);
        console.log(`  Eficiencia: ${eficiencia}`);
        console.log(`  Carga Ponderada: ${cargaPonderada}`);

        return { agente, cargaPonderada };
      });


      // Ordenar por carga ponderada
      agentesOrdenados.sort((a, b) => a.cargaPonderada - b.cargaPonderada);

      // Seleccionar agente por rotación
      if (ultimaAsignacion) {
        const indiceUltimaAsignacion = agentesOrdenados.findIndex(
          (a) => a.agente.id === ultimaAsignacion
        );
        const siguienteIndice =
          (indiceUltimaAsignacion + 1) % agentesOrdenados.length;
        mejorAgente = agentesOrdenados[siguienteIndice].agente;
      } else {
        mejorAgente = agentesOrdenados[0].agente;
      }
    }

    if (!mejorAgente) {
      return res.status(500).json({ error: "No se encontró un agente adecuado para asignar" });
    }

    // Actualizar la última asignación
    ultimaAsignacion = mejorAgente.id;

    // Crear ticket
    const newTicket = await Ticket.create({
      tipo_solicitud,
      categoria_id: categoria_id || null,
      subcategoria_id: subcategoria_id || null,
      id_solicitante,
      ubicacion: ubicacion || null,
      prioridad,
      urgencia,
      estado: "Abierto",
      hora_solicitud: new Date(),
      fecha_vencimiento: fecha_vencimiento || null,
      tiempo_estimado: tiempoEstimado,
      asignado_a: mejorAgente.id,
    });

    console.log("Ticket creado exitosamente:", newTicket);

    // Registrar en el historial
    await HistoricoAsignaciones.create({
      ticket_id: newTicket.id,
      agente_id: mejorAgente.id,
      estado_inicial: "Abierto",
      estado_final: "En proceso",
      motivo_reasignacion: null,
    });

    res.status(201).json({ message: "Ticket creado y asignado automáticamente", ticket: newTicket });
  } catch (error) {
    console.error("Error al crear el ticket automáticamente:", error);
    res.status(500).json({ error: "Error al crear el ticket automáticamente" });
  }
};






export const updateTicket = async (req, res) => {
  const { id } = req.params;
  const {
    estado,
    asignado_a,
    id_gestor,
    motivo_reasignacion,
    ...otherUpdates // Captura otros campos enviados en la solicitud
  } = req.body;

  console.log("Datos a actualizar:", { estado, asignado_a, id_gestor, otherUpdates });

  try {
    // Buscar el ticket por ID
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    const ahora = new Date();
    const estadoInicial = ticket.estado; // Estado actual antes de actualizar
    const agenteInicial = ticket.asignado_a; // Agente actual antes de actualizar
    const gestorInicial = ticket.id_gestor; // Gestor actual antes de actualizar

    // Detectar si hubo cambios en estado, asignado_a, id_gestor
    const estadoCambia = estado && estado !== estadoInicial;
    const agenteCambia = asignado_a && asignado_a !== agenteInicial;
    const gestorCambia = id_gestor && id_gestor !== gestorInicial;

    // Cálculo de tiempo transcurrido desde el último cambio
    const ultimoCambio = new Date(ticket.ultimo_cambio_estado || ticket.hora_solicitud);
    const tiempoTranscurrido = Math.floor((ahora - ultimoCambio) / (1000 * 60)); // Minutos transcurridos

    // Inicializar tiempos acumulados si no están definidos
    let tiempoEspera = ticket.tiempo_espera || 0;
    let tiempoAbierto = ticket.tiempo_abierto || 0;

    // Sumar tiempo transcurrido basado en el estado inicial
    if (estadoInicial === "En espera") {
      tiempoEspera += tiempoTranscurrido;
    } else if (estadoInicial === "Abierto") {
      tiempoAbierto += tiempoTranscurrido;
    }

    // Preparar datos para la actualización
    const updatedData = {
      ...otherUpdates, // Otros campos como categoría, subcategoría, prioridad, etc.
      estado: estado || ticket.estado, // Actualizar estado si fue enviado
      asignado_a: asignado_a || ticket.asignado_a, // Actualizar asignado_a si fue enviado
      id_gestor: id_gestor || ticket.id_gestor, // Actualizar id_gestor si fue enviado
      ultimo_cambio_estado: estadoCambia ? ahora : ticket.ultimo_cambio_estado, // Actualiza solo si el estado cambió
      tiempo_espera: tiempoEspera,
      tiempo_abierto: tiempoAbierto,
    };

    // Actualizar el ticket
    await ticket.update(updatedData);

    // Si el estado, el agente o el gestor cambiaron, registrar en HistoricoAsignaciones
    if (estadoCambia || agenteCambia || gestorCambia) {
      await HistoricoAsignaciones.create({
        ticket_id: ticket.id,
        agente_id: asignado_a || ticket.asignado_a, // Agente asignado
        fecha_asignacion: ahora,
        estado_inicial: estadoInicial || ticket.estado, // Usa el estado actual como valor predeterminado
        estado_final: estado || ticket.estado, // Usa el nuevo estado o el estado actual como valor predeterminado
        motivo_reasignacion: motivo_reasignacion || null, // Campo opcional
      });
    }

    res.status(200).json({ message: "Ticket actualizado correctamente", ticket });
  } catch (error) {
    console.error("Error al actualizar el ticket:", error);
    res.status(500).json({ error: "Error al actualizar el ticket" });
  }
};

// Generar reporte de tickets por rango de fechas
export const getTicketsReport = async (req, res) => {
  const { startDate, endDate, estado, agenteId } = req.query; // Agregar agenteId como parámetro

  try {
    // Validar fechas
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Por favor, proporciona startDate y endDate." });
    }

    // Construir los rangos de fecha, asegurando que el final sea a las 23:59:59
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    console.log("Rango de fechas recibido:", { startDate, endDate });
    console.log("Rango de fechas aplicado:", { start, end });

    // Construir los filtros
    const filtros = {
      hora_solicitud: {
        [Op.between]: [start, end],
      },
    };

    // Agregar filtro por estado si se proporciona
    if (estado) {
      filtros.estado = estado;
    }

    // Agregar filtro por agente asignado si se proporciona
    if (agenteId) {
      filtros.asignado_a = agenteId;
    }

    console.log("Filtros aplicados:", filtros);

    // Obtener los tickets desde la base de datos
    const tickets = await Ticket.findAll({
      where: filtros,
      attributes: [
        'id',
        'tipo_solicitud',
        'estado',
        'hora_solicitud',
        'ultimo_cambio_estado',
        'tiempo_espera',
        'tiempo_abierto',
        'prioridad',
        'urgencia',
        'asignado_a',
      ],
    });

    console.log("Tickets encontrados:", tickets.length);

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: "No se encontraron tickets con los filtros especificados." });
    }

    // Calcular estadísticas del reporte
    const totalTickets = tickets.length;
    const tiempoEsperaPromedio = tickets.reduce((acc, t) => acc + (t.tiempo_espera || 0), 0) / totalTickets;
    const tiempoAbiertoPromedio = tickets.reduce((acc, t) => acc + (t.tiempo_abierto || 0), 0) / totalTickets;

    res.status(200).json({
      totalTickets,
      tiempoEsperaPromedio: tiempoEsperaPromedio.toFixed(2),
      tiempoAbiertoPromedio: tiempoAbiertoPromedio.toFixed(2),
      tickets,
    });
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).json({ error: "Error al generar el reporte." });
  }
};