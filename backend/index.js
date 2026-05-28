import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './src/routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://archivage-kohl.vercel.app', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API GED Archivage', version: '1.0.0' },
    servers: [{ url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}` }],
  },
  apis: ['./src/routes/*.js'],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

app.listen(PORT, () => console.log(`✅ Serveur prêt sur le port ${PORT}`));
