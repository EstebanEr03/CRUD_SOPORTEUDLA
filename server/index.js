import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import db from './models/db.js';
import userRoutes from './routes/userRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001; // Usar puerto de entorno si está disponible

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['https://transcendent-sawine-b81460.netlify.app', 'http://localhost:3000'], // Agrega ambos orígenes si estás probando localmente
  credentials: true,  // Permitir credenciales, como cookies o tokens
}));

app.use(cookieParser());

// Usa las rutas importadas
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes); // Agrega las rutas de los tickets
app.use('/api/categories', categoryRoutes); // Define el prefijo para el endpoint de categorías


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
