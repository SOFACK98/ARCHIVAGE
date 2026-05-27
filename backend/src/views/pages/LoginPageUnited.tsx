import React, { useState } from 'react';
import { Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
 
      try {
        // Récupère l'URL de Render (Vercel l'injectera), sinon utilise le proxy local '/api'
        const baseURL = import.meta.env.VITE_API_URL || '';
        
        const response = await fetch(`${baseURL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });


      const data = await response.json();
      
      if (response.ok && data.token && data.user) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setError(data.message || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a2e] via-[#0d3b6e] to-[#0f62a8] flex flex-col">
      {/* Topbar */}
      <div className="h-14 bg-[#0a1a2e]/90 border-b border-[#1a8fd1]/30 backdrop-blur-md flex items-center justify-between px-7">
        <div className="flex items-center gap-3">
          <img 
            src="/src/assets/logo_united-removebg.png" 
            alt="United Credit" 
            className="h-10 drop-shadow-[0_0_8px_rgba(46,204,0,0.35)]"
          />
          <span className="font-bold text-xl tracking-wider text-white uppercase">
            United <em className="text-[#2ecc00] not-italic">Credit</em>
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <a href="#" className="text-white/65 hover:text-white hover:bg-[#1a8fd1]/25 px-3 py-1 rounded transition-all">
            🇫🇷 FR
          </a>
          <span className="text-white/25">|</span>
          <a href="#" className="text-white/65 hover:text-white hover:bg-[#1a8fd1]/25 px-3 py-1 rounded transition-all">
            🇬🇧 EN
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-[#0d3b6e]/85 via-[#0a1a2e]/60 to-[#0a1a2e]/95"></div>
        
        {/* Orbs */}
        <div className="absolute w-[520px] h-[520px] rounded-full blur-[80px] opacity-55 bg-gradient-radial from-[#0f62a8] to-transparent top-[-80px] right-[60px]"></div>
        <div className="absolute w-[360px] h-[360px] rounded-full blur-[80px] opacity-35 bg-gradient-radial from-[#1d8a00] to-transparent bottom-[30px] right-[140px]"></div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-[460px] space-y-4 animate-[slideUp_0.55s_cubic-bezier(0.22,0.68,0,1.2)]">
          {/* Title Banner */}
          <div className="bg-gradient-to-br from-[#0d3b6e]/92 to-[#0f62a8]/88 border border-[#1a8fd1]/40 rounded-lg p-5 text-center backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
            <h1 className="font-bold text-2xl tracking-wider text-white uppercase">
              Portail <span className="text-[#2ecc00]">Sécurisé</span>
            </h1>
            <p className="mt-1 text-sm text-white/55 tracking-wide">Système d'Archivage Électronique</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/95 rounded-lg p-8 shadow-[0_12px_48px_rgba(0,0,0,0.45)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0f62a8] via-[#2ecc00] to-[#1a8fd1]"></div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-[#2c4a6e] mb-2 tracking-wide">
                  Identifiant
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-[#c8d8e8] rounded-lg text-[#1a2d44] bg-[#f5f9fc] focus:border-[#0f62a8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0f62a8]/14 transition-all"
                  placeholder="Votre email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2c4a6e] mb-2 tracking-wide">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-[#c8d8e8] rounded-lg text-[#1a2d44] bg-[#f5f9fc] focus:border-[#0f62a8] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0f62a8]/14 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-7 py-4 bg-gradient-to-br from-[#0d3b6e] to-[#0f62a8] text-white font-bold text-lg tracking-widest uppercase rounded-lg shadow-[0_4px_18px_rgba(13,59,110,0.45)] hover:shadow-[0_6px_24px_rgba(13,59,110,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Se Connecter'}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-[#7a96b2]">
              <a href="#" className="text-[#0f62a8] font-semibold hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#9bb0c5]">
              <Shield size={14} className="opacity-70" />
              <span>Connexion sécurisée SSL/TLS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-12 bg-[#0a1a2e]/80 border-t border-[#1a8fd1]/20 backdrop-blur-md flex items-center justify-center text-xs text-white/50">
        © 2026 United Credit – Tous droits réservés
      </div>
    </div>
  );
};
