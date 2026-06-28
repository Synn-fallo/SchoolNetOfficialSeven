import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, GraduationCap, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      const targetEmail = email.trim() || "chefetablissement.workflow@gmail.com";
      const targetPassword = password || "password";
      
      // Call real mock sign in
      await signIn(targetEmail, targetPassword);
      
      // Brief delay for beautiful simulation effect
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/dashboard");
      }, 600);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur de connexion. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center min-h-[calc(100vh-140px)] bg-slate-50/50" id="login-page-container">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 relative" id="login-card">
        {/* Back Button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all border border-slate-100"
          id="btn-login-back"
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
          <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">Plateforme Éducative</p>
          <div className="w-12 h-1 bg-amber-500 mx-auto mt-2.5 rounded-full" />
        </div>

        {/* Demo Warning Banner */}
        <div className="mb-6 p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl text-xs flex flex-col gap-1.5" id="demo-notice">
          <span className="font-bold text-amber-800 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            💡 Simulation de Connexion (Phase 2)
          </span>
          <p className="text-amber-700 leading-relaxed font-medium">
            Cliquez directement sur <strong className="font-bold text-amber-900">Se connecter</strong> pour vous connecter avec le compte de démonstration, ou saisissez l'adresse de votre choix.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Adresse Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="login-email-input"
                type="email"
                placeholder="chefetablissement.workflow@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-600">Mot de Passe</label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-blue-600 hover:underline">Mot de passe oublié ?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                id="toggle-password-btn"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center py-1">
            <input
              id="remember-me-checkbox"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember-me-checkbox" className="ml-2 text-xs text-slate-500 font-bold cursor-pointer">
              Se souvenir de moi
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Connexion</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="text-xs text-center text-slate-400 mt-6 font-semibold">
          Pas de compte ?{" "}
          <Link to="/" className="font-bold text-blue-600 hover:underline">
            S'inscrire &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
