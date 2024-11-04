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
  const { email, password, rol_id } = req.body;

  try {
    // Check if user exists in the `login` table with the specified email
    const userLogin = await Login.findOne({ where: { email } });
    if (!userLogin) return res.status(404).json({ error: 'User not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, userLogin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Verify role in `usuarios` table
    const userData = await User.findOne({ where: { id: userLogin.user_id, rol_id } });
    if (!userData) return res.status(403).json({ error: 'Role mismatch or unauthorized access' });

    // Generate token including the user's role ID
    const token = jwt.sign({ id: userLogin.user_id, rol_id: userData.rol_id }, 'secret_key', { expiresIn: '1h' });

    // Send token and role ID in the response
    res.status(200).json({ message: 'Login successful', token, rol_id: userData.rol_id });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: 'Error logging in' });
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
