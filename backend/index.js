import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// 1. Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// 2. Configuration Supabase (Vérification des variables)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("ERREUR : Variables d'environnement Supabase manquantes !");
}
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 3. Middlewares
app.use(cors({
  origin: ["https://archivage-kohl.vercel.app", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// 4. Route de Connexion (Login)
app.post("/api/auth/login", async (req, res) => {
  const { identifiant, password } = req.body;

  if (!identifiant || !password) {
    return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
  }

  try {
    // Requête Supabase
    const { data: user, error } = await supabase
      .from("utilisateurs")
      .select("*")
      .eq("email", identifiant.trim())
      .single();

    if (error || !user) {
      console.log("Tentative de connexion échouée pour :", identifiant);
      return res.status(401).json({ success: false, message: "Utilisateur non trouvé ou erreur DB" });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      return res.status(200).json({ success: true, message: "Connexion réussie", user });
    } else {
      return res.status(401).json({ success: false, message: "Identifiants incorrects" });
    }
  } catch (err) {
    console.error("Erreur serveur fatale :", err);
    return res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
});

// 5. Documentation Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "API de ma GED", version: "1.0.0" },
    servers: [{ url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}` }],
  },
  apis: ["./index.js"],
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

// 6. Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur prêt sur le port ${PORT}`);
});