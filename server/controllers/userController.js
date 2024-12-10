// server/controllers/userController.js
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import Login from '../models/loginModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Function to fetch all roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: 'Error fetching roles' });
  }
};

// Register new user with role
// server/controllers/userController.js
export const registerUser = async (req, res) => {
  const { nombre, edad, sede, area, email, password, rol_id, is_admin } = req.body;

  if (![1, 2, 3].includes(parseInt(rol_id))) {
    return res.status(400).json({ error: 'Invalid role ID' });
  }

  try {
    const newUser = await User.create({
      nombre,
      edad,
      sede,
      area,
      rol_id,
      is_admin: is_admin || false, // Por defecto no es admin
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    await Login.create({
      user_id: newUser.id,
      email,
      password: hashedPassword,
    });

    res.status(200).json({ message: 'User and login created successfully' });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: 'Error registering user' });
  }
};



// Login function
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userLogin = await Login.findOne({ where: { email } });
    if (!userLogin) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, userLogin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const userData = await User.findOne({ where: { id: userLogin.user_id } });
    if (!userData) {
      return res.status(403).json({ error: 'Usuario no autorizado' });
    }

    const token = jwt.sign(
      {
        id: userLogin.user_id,
        rol_id: userData.rol_id,
        is_admin: userData.is_admin, // Incluye el estado de administrador
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Inicio de sesión exitoso', token, rol_id: userData.rol_id, is_admin: userData.is_admin });
  } catch (error) {
    console.error('Error durante el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Get all empleados
export const getEmpleados = async (req, res) => {
  try {
    console.log('Solicitud recibida para obtener empleados');
    const empleados = await User.findAll({
      attributes: ['id', 'nombre', 'edad', 'sede', 'area', 'rol_id'],
    });
    console.log('Usuarios obtenidos:', empleados);
    res.status(200).json(empleados);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};



// Update an empleado
export const updateEmpleado = async (req, res) => {
  const { id, nombre, edad, sede, area, rol_id, is_admin } = req.body;
  try {
    const result = await User.update(
      { nombre, edad, sede, area, rol_id, is_admin },
      { where: { id } }
    );
    if (result[0] === 0) {
      return res.status(400).json({ error: 'No se encontró el empleado o no se realizaron cambios' });
    }
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno al actualizar el usuario' });
  }
};



// Delete an empleado
export const deleteEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await User.destroy({ where: { id } });
    if (result === 0) {
      return res.status(400).json({ error: 'No se encontró el empleado' });
    }
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno al eliminar el usuario' });
  }
};

