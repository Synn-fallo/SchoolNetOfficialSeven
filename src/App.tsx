import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ParentAnnoncesScreen from "@/pages/ParentAnnonces";
import { AuthProvider } from "@/contexts/AuthContext";
import { NominationProvider } from "@/contexts/NominationContext";
import { DelegationProvider } from "@/contexts/DelegationContext";

// New Public Pages
import PublicEtablissements from "@/pages/PublicEtablissements";
import PublicEtablissementDetail from "@/pages/PublicEtablissementDetail";
import PublicEtablissementActualites from "@/pages/PublicEtablissementActualites";
import PublicEtablissementSite from "@/pages/PublicEtablissementSite";
import PublicAPropos from "@/pages/PublicAPropos";
import PublicCommentCaMarche from "@/pages/PublicCommentCaMarche";
import PublicAutoInscription from "@/pages/PublicAutoInscription";
import PublicLegal from "@/pages/PublicLegal";
import PublicPrivacy from "@/pages/PublicPrivacy";
import PublicCharteEleve from "@/pages/PublicCharteEleve";
import PublicCharteEnseignant from "@/pages/PublicCharteEnseignant";
import PublicCharteParent from "@/pages/PublicCharteParent";

export default function App() {
  return (
    <AuthProvider>
      <NominationProvider>
        <DelegationProvider>
          <Layout>
            <Routes>
              {/* Core Landing & Authentication */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/parent/annonces" element={<ParentAnnoncesScreen />} />
              <Route path="/annonces" element={<ParentAnnoncesScreen />} />

              {/* Public Directories (Both standard & prefixed routes for absolute compatibility) */}
              <Route path="/etablissements" element={<PublicEtablissements />} />
              <Route path="/public/etablissements" element={<PublicEtablissements />} />
              
              <Route path="/etablissements/:slug" element={<PublicEtablissementDetail />} />
              <Route path="/public/etablissements/:slug" element={<PublicEtablissementDetail />} />

              <Route path="/etablissements/:slug/actualites" element={<PublicEtablissementActualites />} />
              <Route path="/public/etablissements/:slug/actualites" element={<PublicEtablissementActualites />} />

              <Route path="/etablissements/:slug/site" element={<PublicEtablissementSite />} />
              <Route path="/public/etablissements/:slug/site" element={<PublicEtablissementSite />} />

              {/* Administrative & Information pages */}
              <Route path="/a-propos" element={<PublicAPropos />} />
              <Route path="/comment-ca-marche" element={<PublicCommentCaMarche />} />
              <Route path="/auto-inscription" element={<PublicAutoInscription />} />

              {/* Legal & Compliance */}
              <Route path="/legal" element={<PublicLegal />} />
              <Route path="/privacy" element={<PublicPrivacy />} />

              {/* Charters */}
              <Route path="/charte-eleve" element={<PublicCharteEleve />} />
              <Route path="/charte-enseignant" element={<PublicCharteEnseignant />} />
              <Route path="/charte-parent" element={<PublicCharteParent />} />
            </Routes>
          </Layout>
        </DelegationProvider>
      </NominationProvider>
    </AuthProvider>
  );
}

