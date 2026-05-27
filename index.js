import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de Swagger
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
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./index.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @openapi
 * /documents:
 * get:
 * description: Récupère la liste de tous les documents
 * responses:
 * 200:
 * description: Succès
 */
app.get('/documents', (req, res) => {
  res.json({ message: "Liste des documents consultée" });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📄 Documentation : http://localhost:${PORT}/api-docs`);
});