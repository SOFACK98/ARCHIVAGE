import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors"; // 1. Ajout de l'import CORS
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt"; // Importez bcrypt

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Configuration globale de CORS pour accepter Vercel et le local
app.use(
  cors({
    origin: ["https://archivage-kohl.vercel.app", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Permet à Express de lire le JSON envoyé par Vercel lors de la connexion
app.use(express.json());

// app.post('/api/auth/login', (req, res) => {
//   const { identifiant, password } = req.body;

//   // Exemple simple : remplacez par votre logique de base de données
//   if (identifiant === "etogo" && password === "123") {
//     res.status(200).json({ success: true, message: "Connexion autorisée" });
//   } else {
//     res.status(401).json({ success: false, message: "Identifiants incorrects" });
//   }
// });

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de ma GED",
      version: "1.0.0",
      description: "Système de Gestion Électronique des Documents",
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`, // URL dynamique (Render ou Local)
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/documents", (req, res) => {
  res.json({ message: "Liste des documents consultée" });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📄 Documentation : http://localhost:${PORT}/api-docs`);

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
  );

  app.post("/api/auth/login", async (req, res) => {
    const { identifiant, password } = req.body;

    try {
      // 1. Récupérer l'utilisateur par son email
      const { data: user, error } = await supabase
        .from("utilisateurs")
        .select("*")
        .eq("email", identifiant) // 'identifiant' est l'email
        .single();

      if (error || !user) {
        return res
          .status(401)
          .json({ success: false, message: "Utilisateur non trouvé" });
      }
      if (error) {
        console.error("Erreur Supabase :", error); // CECI EST IMPORTANT
        return res
          .status(500)
          .json({ success: false, message: "Erreur DB: " + error.message });
      }

      // 2. Comparer le mot de passe saisi avec le hash stocké
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (isMatch) {
        res
          .status(200)
          .json({ success: true, message: "Connexion réussie", user });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Identifiants incorrects" });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  });
});
