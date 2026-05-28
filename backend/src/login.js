const handleLogin = async (e) => {
  e.preventDefault(); // Empêche le rechargement de la page

  try {
    const response = await fetch('https://archivage-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiant, password }) // Envoi des données
    });

    const data = await response.json();

    if (response.ok) {
      // 1. Succès : La connexion a été validée par le backend
      console.log("Connexion réussie :", data);
      alert("Connexion réussie !");
      
      // Ici, vous redirigeriez vers le tableau de bord
      // window.location.href = '/dashboard'; 
    } else {
      // 2. Erreur : Identifiants faux ou erreur serveur
      console.error("Erreur de connexion :", data.message);
      alert(data.message || "Identifiants incorrects");
    }
  } catch (error) {
    // 3. Erreur réseau : Le serveur est injoignable
    console.error("Erreur réseau :", error);
    alert("Impossible de joindre le serveur. Veuillez réessayer plus tard.");
  }
};