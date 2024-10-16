import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import db from './models/db.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = 3001;

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(cookieParser());

// Usa las rutas importadas
app.use('/api/users', userRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
