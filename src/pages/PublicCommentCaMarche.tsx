import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Check, 
  CheckCircle, 
  HelpCircle, 
  Star, 
  Users, 
  Laptop, 
  BookOpen, 
  Lock,
  Smartphone,
  CreditCard,
  X,
  Loader2,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function PublicCommentCaMarche() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const { user, isChefEtablissement, activeRole, profile } = useAuth();

  // State for subscription flow
  const [checkoutPlan, setCheckoutPlan] = useState<"freemium" | "essentiel" | "premium" | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<"mtn" | "moov" | "ccash" | "card">("mtn");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"input" | "loading" | "success">("input");
  const [showRoleNotice, setShowRoleNotice] = useState(false);

  const steps = [
    {
      icon: <Laptop className="h-6 w-6 text-blue-600" />,
      title: "1. Inscription administrative",
      desc: "L'école s'inscrit en quelques clics, soumet sa demande administrative officielle et choisit sa formule d'abonnement."
    },
    {
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      title: "2. Invitation des membres",
      desc: "L'administration crée des comptes sécurisés ou génère des codes d'invitation uniques pour les enseignants, parents et élèves."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-emerald-600" />,
      title: "3. Suivi et communication",
      desc: "Saisie des notes, devoirs, diffusion des actualités de l'école et consultation sécurisée en temps réel pour tous les acteurs."
    }
  ];

  const handlePlanSelection = (plan: "freemium" | "essentiel" | "premium") => {
    // If not logged in, standard redirection
    if (!user) {
      window.location.href = `/auto-inscription?plan=${plan}`;
      return;
    }

    // If logged in: check role
    const isPromoter = isChefEtablissement || activeRole === "admin" || activeRole === "chef_etablissement";
    
    if (!isPromoter) {
      setShowRoleNotice(true);
      return;
    }

    if (plan === "freemium") {
      alert("Votre établissement bénéficie déjà du plan d'Affiliation Gratuite. Choisissez Essentiel ou Premium pour débloquer les autres fonctionnalités.");
      return;
    }

    // Open checkout flow
    setCheckoutPlan(plan);
    setPaymentStep("input");
    setCheckoutMethod("mtn");
    setMobileNumber("");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep("loading");
    
    // Simulate real local payment gateway processing (Orange Money / Wave)
    setTimeout(() => {
      setPaymentStep("success");
    }, 2500);
  };

  const getPlanPriceText = () => {
    if (checkoutPlan === "essentiel") {
      return billingPeriod === "monthly" ? "14 900 FCFA / mois" : "104 900 FCFA / an";
    }
    if (checkoutPlan === "premium") {
      return billingPeriod === "monthly" ? "24 900 FCFA / mois" : "149 900 FCFA / an";
    }
    return "0 FCFA";
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" id="how-it-works-root">
      
      {/* Header Info */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/30">
          Guide Complet & Tarifs
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
          Comment fonctionne la <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Plateforme SchoolNet</span> ?
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Un déploiement simple, transparent et sécurisé pour moderniser en temps record la vie scolaire de votre établissement.
        </p>
      </div>

      {/* 3 Step Flow Section */}
      <div className="space-y-6">
        <h2 className="text-base font-extrabold text-slate-800 text-center uppercase tracking-wider">Un processus en 3 étapes simples</h2>
        
        <div className="grid md:grid-cols-3 gap-6" id="steps-container">
          {steps.map((st, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 text-left">
              <div className="p-3 bg-slate-50 rounded-xl w-fit border border-slate-100/50">
                {st.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-800">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Pricing Section */}
      <div className="space-y-8 pt-6 border-t border-slate-100">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Des tarifs simples, adaptés à vos besoins</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Abonnements sans engagement pour les écoles</p>
          
          {user && (isChefEtablissement || activeRole === "admin" || activeRole === "chef_etablissement") && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 mx-auto mt-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Compte Promoteur Connecté — Activation Immédiate Validée !</span>
            </div>
          )}

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 mt-2">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingPeriod === "monthly" 
                  ? "bg-white text-slate-800 shadow" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Facturation Mensuelle
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingPeriod === "yearly" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Facturation Annuelle
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                billingPeriod === "yearly" ? "bg-white text-blue-700" : "bg-emerald-100 text-emerald-800"
              }`}>
                Jusqu'à -49%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 pt-2">
          
          {/* Plan Freemium */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-wider">Freemium</span>
              <h3 className="text-base font-black text-slate-800">Affiliation Gratuite</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Parfait pour figurer dans l'annuaire national officiel et recevoir des manifestations d'intérêt.</p>
              
              <div className="space-y-2.5 pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Présence sur l'annuaire</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Réception des manifestations d'intérêt</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-400">
                  <Lock className="h-4 w-4 text-slate-300 flex-shrink-0" />
                  <span>Portails de suivi pédagogique</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-400">
                  <Lock className="h-4 w-4 text-slate-300 flex-shrink-0" />
                  <span>Portails Parents/Élèves connectés</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <p className="text-xl font-black text-slate-800 font-mono">0 FCFA</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gratuit à vie</p>
              </div>
              <button
                onClick={() => handlePlanSelection("freemium")}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs text-center block border border-slate-200 transition-colors cursor-pointer"
              >
                {user && (isChefEtablissement || activeRole === "admin" || activeRole === "chef_etablissement") ? "Forfait Activé d'Office" : "Inscrire mon école"}
              </button>
            </div>
          </div>

          {/* Plan Essentiel */}
          <div className="bg-white rounded-3xl border border-indigo-100 p-6 flex flex-col justify-between shadow-sm space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50">Essentiel</span>
              <h3 className="text-base font-black text-slate-800">Formule Essentielle</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Suivi académique complet, relevés et gestion des notes.</p>
              
              <div className="space-y-2.5 pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Présence sur l'annuaire public</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Portails de gestion des notes & absences</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Bulletins de notes & suivi pédagogique</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-400">
                  <Lock className="h-4 w-4 text-slate-300 flex-shrink-0" />
                  <span>Site web vitrine public Premium</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-50">
              {/* Highlight active selection amount */}
              <div className="p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 space-y-1">
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block">Option active sélectionnée</span>
                {billingPeriod === "monthly" ? (
                  <div className="space-y-0.5">
                    <p className="text-xl font-black text-indigo-700 font-mono">14 900 FCFA <span className="text-xs text-indigo-500 font-bold">/ mois</span></p>
                    <p className="text-[9px] text-slate-500 font-semibold leading-none">Paiement mensuel récurrent</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-xl font-black text-indigo-700 font-mono">104 900 FCFA <span className="text-xs text-indigo-500 font-bold">/ an</span></p>
                    <p className="text-[9px] text-emerald-600 font-extrabold leading-none">✨ Soit seulement ~8 740 FCFA / mois</p>
                  </div>
                )}
              </div>

              {/* Immutable Annual Promo Incentive */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 space-y-1">
                <p className="text-[11px] font-black text-slate-700 font-mono">104 900 FCFA / an</p>
                <p className="text-[9px] text-emerald-800 bg-white border border-emerald-200 rounded-md py-0.5 px-2 font-bold text-center inline-block">
                  ⚡ +40% de réduction immédiate
                </p>
                <p className="text-[9px] text-slate-500 leading-normal pt-0.5 border-t border-slate-100/50 mt-1">
                  Économisez sur l'année complète : <strong className="font-extrabold text-emerald-600">73 900 FCFA</strong>
                </p>
              </div>

              <button 
                onClick={() => handlePlanSelection("essentiel")}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center block shadow transition-all cursor-pointer"
              >
                {user && (isChefEtablissement || activeRole === "admin" || activeRole === "chef_etablissement") ? "Activer l'offre Essentiel maintenant" : "Choisir Essentiel"}
              </button>
            </div>
          </div>

          {/* Plan Premium */}
          <div className="bg-white rounded-3xl border border-amber-300 p-6 flex flex-col justify-between shadow-md space-y-6 relative overflow-hidden">
            <span className="absolute top-0 right-0 text-[8px] font-extrabold bg-amber-500 text-slate-900 px-3 py-0.5 rounded-bl uppercase tracking-wider">Recommandé</span>
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50 flex items-center gap-0.5 w-fit">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Premium
              </span>
              <h3 className="text-base font-black text-slate-800">Formule Premium</h3>
              <p className="text-xs text-slate-400 leading-relaxed">La numérisation complète, site vitrine officiel inclus.</p>
              
              <div className="space-y-2.5 pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Présence prioritaire sur l'annuaire</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Portails de suivi complet (Notes, Absences, etc.)</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Site Web Vitrine Premium officiel</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Publication d'actualités officielles</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-50">
              {/* Highlight active selection amount */}
              <div className="p-3 rounded-2xl bg-amber-50/20 border border-amber-200/50 space-y-1">
                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Option active sélectionnée</span>
                {billingPeriod === "monthly" ? (
                  <div className="space-y-0.5">
                    <p className="text-xl font-black text-amber-700 font-mono">24 900 FCFA <span className="text-xs text-amber-500 font-bold">/ mois</span></p>
                    <p className="text-[9px] text-slate-500 font-semibold leading-none">Paiement mensuel récurrent</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-xl font-black text-amber-700 font-mono">149 900 FCFA <span className="text-xs text-amber-500 font-bold">/ an</span></p>
                    <p className="text-[9px] text-emerald-600 font-extrabold leading-none">✨ Soit seulement ~12 490 FCFA / mois</p>
                  </div>
                )}
              </div>

              {/* Immutable Annual Promo Incentive */}
              <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-3 space-y-1">
                <p className="text-[11px] font-black text-slate-700 font-mono">149 900 FCFA / an</p>
                <p className="text-[9px] text-amber-800 bg-white border border-amber-200 rounded-md py-0.5 px-2 font-bold text-center inline-block">
                  ⚡ +49% de réduction immédiate
                </p>
                <p className="text-[9px] text-slate-500 leading-normal pt-0.5 border-t border-slate-100/50 mt-1">
                  Économisez sur l'année complète : <strong className="font-extrabold text-amber-600">148 900 FCFA</strong>
                </p>
              </div>

              <button 
                onClick={() => handlePlanSelection("premium")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold text-xs text-center block shadow transition-all cursor-pointer"
              >
                {user && (isChefEtablissement || activeRole === "admin" || activeRole === "chef_etablissement") ? "Activer l'offre Premium maintenant" : "Choisir Premium"}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Trust Badge or FAQ section */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100 max-w-3xl mx-auto flex items-start gap-4 text-left">
        <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800">Période d'évaluation et de déploiement</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Toutes nos formules d'abonnement s'accompagnent d'un accompagnement personnalisé gratuit de 14 jours par nos experts S.I afin d'intégrer vos listes d'élèves, de former vos personnels administratifs et d'élaborer la charte graphique de votre site officiel.
          </p>
        </div>
      </div>

      {/* MODAL 1: CHECKOUT FOR CONNECTED PROMOTERS */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl overflow-hidden relative text-left max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setCheckoutPlan(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors border border-slate-100 z-10 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="overflow-y-auto p-6 space-y-5 flex-1 max-h-[85vh]">
                {paymentStep === "input" && (
                  <form onSubmit={handlePaymentSubmit} className="space-y-5">
                    <div className="space-y-1 pr-6">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                        checkoutPlan === "premium" ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
                      }`}>
                        Formule {checkoutPlan}
                      </span>
                      <h3 className="text-base font-black text-slate-800">Paiement Sécurisé</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Activer l'offre de suivi pour votre établissement en payant directement en ligne.
                      </p>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500 font-semibold">
                        <span>Période choisie :</span>
                        <span className="capitalize">{billingPeriod === "monthly" ? "Mensuel" : "Annuel"}</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-100 mt-1">
                        <span>Montant à payer :</span>
                        <span className="text-sm text-blue-600 font-mono font-black">{getPlanPriceText()}</span>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Mode de paiement local (Bénin)</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setCheckoutMethod("mtn")}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                            checkoutMethod === "mtn" 
                              ? "border-yellow-500 bg-yellow-50/20 text-yellow-800" 
                              : "border-slate-100 hover:border-slate-200 text-slate-600"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-slate-900 text-[10px] font-black font-sans shadow-sm">MTN</div>
                          <span>MTN MoMo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCheckoutMethod("moov")}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                            checkoutMethod === "moov" 
                              ? "border-emerald-500 bg-emerald-50/20 text-emerald-800" 
                              : "border-slate-100 hover:border-slate-200 text-slate-600"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black font-sans shadow-sm">MOOV</div>
                          <span>Moov Money</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCheckoutMethod("ccash")}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                            checkoutMethod === "ccash" 
                              ? "border-purple-500 bg-purple-50/20 text-purple-800" 
                              : "border-slate-100 hover:border-slate-200 text-slate-600"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-[9px] font-black font-sans shadow-sm">CELT</div>
                          <span>C'CASH Celtiis</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCheckoutMethod("card")}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                            checkoutMethod === "card" 
                              ? "border-slate-600 bg-slate-50 text-slate-800" 
                              : "border-slate-100 hover:border-slate-200 text-slate-600"
                          }`}
                        >
                          <CreditCard className="h-8 w-8 text-slate-500" />
                          <span>Carte Bancaire</span>
                        </button>
                      </div>
                    </div>

                    {/* Phone input for mobile money */}
                    {checkoutMethod !== "card" ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">
                          Saisissez votre numéro de téléphone {checkoutMethod === "mtn" ? "MTN MoMo" : checkoutMethod === "moov" ? "Moov Money" : "C'CASH Celtiis"}
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="tel"
                            required
                            placeholder="Ex: +229 01 00 00 00"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600 block">Numéro de Carte</label>
                          <input
                            type="text"
                            required
                            placeholder="4000 1234 5678 9010"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">Expiration</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/AA"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 block">CVC</label>
                            <input
                              type="text"
                              required
                              placeholder="123"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-xs font-semibold text-slate-700 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer font-sans"
                    >
                      Confirmer le paiement de {getPlanPriceText()}
                    </button>
                  </form>
                )}

                {paymentStep === "loading" && (
                  <div className="text-center py-6 space-y-4">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-slate-800">Validation en cours...</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Veuillez vérifier votre téléphone portable et valider la transaction en saisissant votre code secret de paiement.
                      </p>
                    </div>
                  </div>
                )}

                {paymentStep === "success" && (
                  <div className="text-center py-6 space-y-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100">
                      <CheckCircle className="h-6 w-6 animate-bounce" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black text-slate-800">Abonnement Activé avec Succès !</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Félicitations, votre école bénéficie désormais des avantages du forfait <strong className="font-extrabold capitalize text-slate-700">{checkoutPlan}</strong>. Les portails correspondants ont été débloqués instantanément !
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setCheckoutPlan(null)}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white text-center shadow-sm transition-all cursor-pointer"
                      >
                        Accéder à mon espace Dashboard
                      </Link>
                      <button
                        onClick={() => setCheckoutPlan(null)}
                        className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 transition-colors cursor-pointer"
                      >
                        Fermer la fenêtre
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: FOR NON-PROMOTER LOGGED IN USERS */}
      <AnimatePresence>
        {showRoleNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl space-y-4 text-center text-left"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-slate-800">Souscription réservée à la direction</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seul le promoteur (Chef d'Établissement) ou l'administrateur de l'école est habilité à choisir une formule et à effectuer le règlement des abonnements officiels.
                </p>
                {profile?.role && (
                  <p className="text-[11px] text-indigo-600 font-extrabold bg-indigo-50/50 py-1 px-3.5 rounded-lg inline-block">
                    Votre rôle actuel : {profile.role === "parent" ? "👪 Parent d'élève" : profile.role === "eleve" ? "🎓 Élève" : profile.role === "enseignant" ? "📚 Enseignant" : "Sympathisant"}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowRoleNotice(false);
                    // Simulate gentle action
                    alert("Une notification polie d'intérêt pour cette offre d'abonnement a été envoyée anonymement à l'administrateur de l'établissement.");
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white text-center shadow-sm"
                >
                  📢 Recommander l'offre à mon école
                </button>
                <button
                  onClick={() => setShowRoleNotice(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
