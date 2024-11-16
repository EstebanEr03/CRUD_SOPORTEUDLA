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
export const registerUser = async (req, res) => {
  const { nombre, edad, sede, area, email, password, rol_id } = req.body;

  try {
    // Create the user record in `usuarios` table
    const newUser = await User.create({
      nombre,
      edad,
      sede,
      area,
      rol_id,
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into `login` table with `user_id` from newUser
    await Login.create({
      user_id: newUser.id, // Use the ID of the newly created user
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
    // Verificar si el usuario existe en la tabla `login`
    const userLogin = await Login.findOne({ where: { email } });
    if (!userLogin) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Comparar la contraseña encriptada
    const isMatch = await bcrypt.compare(password, userLogin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Obtener datos del usuario desde la tabla `usuarios`
    const userData = await User.findOne({ where: { id: userLogin.user_id } });
    if (!userData) {
      return res.status(403).json({ error: 'Usuario no autorizado' });
    }

    // Generar un token JWT con el ID y el rol
    const token = jwt.sign(
      { id: userLogin.user_id, rol_id: userData.rol_id },
      process.env.JWT_SECRET || 'secret_key', // Mejor usar una variable de entorno para la clave
      { expiresIn: '1h' }
    );

    // Devolver el token y el rol
    res.status(200).json({ message: 'Inicio de sesión exitoso', token, rol_id: userData.rol_id });
  } catch (error) {
    console.error('Error durante el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Get all empleados
export const getEmpleados = async (req, res) => {
  try {
    const empleados = await User.findAll();
    res.status(200).json(empleados);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Update an empleado
export const updateEmpleado = async (req, res) => {
  const { id, nombre, edad, sede, area, rol_id } = req.body;
  try {
    await User.update({ nombre, edad, sede, area, rol_id }, { where: { id } });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: 'Error updating user' });
  }
};

// Delete an empleado
export const deleteEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    await User.destroy({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};
