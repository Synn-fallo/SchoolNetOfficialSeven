import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  GraduationCap, 
  UserPlus 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicAutoInscription() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (!email || !password || !nom || !prenom) {
        setError("Tous les champs sont requis");
        setLoading(false);
        return;
      }

      // Create visitor account and register the profile/role
      await signUp(email, password, { nom, prenom });
      
      // Delay for propagation simulation and professional visual touch
      setTimeout(() => {
        setLoading(false);
        navigate("/dashboard");
      }, 1500);
      
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Erreur lors de l'inscription");
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center min-h-[calc(100vh-140px)] bg-slate-50/50" id="register-page-container">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 relative animate-in fade-in slide-in-from-bottom-3 duration-300" id="register-card">
        
        {/* Back Button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all border border-slate-100"
          id="btn-register-back"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Retour</span>
        </Link>

        {/* Card Header */}
        <div className="text-center mb-6 mt-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4 border border-blue-100/50">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-sans">SchoolNet</h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">Créer un compte</p>
          <div className="w-12 h-1 bg-amber-500 mx-auto mt-2.5 rounded-full" />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4" id="register-form">
          {/* Prénom */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Prénom</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="register-prenom-input"
                type="text"
                required
                disabled={loading}
                placeholder="Ex: Ousmane"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Nom */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Nom</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="register-nom-input"
                type="text"
                required
                disabled={loading}
                placeholder="Ex: Sow"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Adresse Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="register-email-input"
                type="email"
                required
                disabled={loading}
                placeholder="Ex: o.sow@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Mot de passe</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="register-password-input"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                id="toggle-register-password-btn"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>S'inscrire</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="text-xs text-center text-slate-400 mt-6 font-semibold">
          Déjà inscrit ?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Se connecter &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
