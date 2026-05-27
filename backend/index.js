import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors'; // 1. Ajout de l'import CORS

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Configuration globale de CORS pour accepter Vercel et le local
app.use(cors({
  origin: ['https://archivage-kohl.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Permet à Express de lire le JSON envoyé par Vercel lors de la connexion
app.use(express.json());


app.post('/api/auth/login', (req, res) => {
  const { identifiant, password } = req.body;
  
  // LOGIQUE TEMPORAIRE POUR TESTER
  console.log("Tentative de connexion pour :", identifiant);
  
  // Simulez une réponse positive pour voir si le blocage saute
  res.status(200).json({ message: "Connexion réussie (test)" });
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de ma GED',
      version: '1.0.0',
      description: 'Système de Gestion Électronique des Documents',
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`, // URL dynamique (Render ou Local)
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/documents', (req, res) => {
  res.json({ message: "Liste des documents consultée" });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📄 Documentation : http://localhost:${PORT}/api-docs`);
});