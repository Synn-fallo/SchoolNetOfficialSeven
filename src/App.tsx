// /home/project/src/App.tsx
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

// ============================================================
// ✅ PAGES ADMIN (PHASE 2)
// ============================================================
import AdminDemandesRole from "@/pages/AdminDemandesRole";
import AdminDemandesEtablissements from "@/pages/AdminDemandesEtablissements";
import AdminDemandesPartenariats from "@/pages/AdminDemandesPartenariats";
import AdminEducMasterConfig from "@/pages/AdminEducMasterConfig";
import AdminUtilisateurs from "@/pages/AdminUtilisateurs";
import AdminScolarite from "@/pages/AdminScolarite";

// ============================================================
// ✅ PAGES ENSEIGNANT (PHASE 3)
// ============================================================
import EnseignantDashboard from "@/pages/EnseignantDashboard";
import EnseignantMesClasses from "@/pages/EnseignantMesClasses";
import EnseignantNotes from "@/pages/EnseignantNotes";
import EnseignantCahierTexte from "@/pages/EnseignantCahierTexte";
import EnseignantReleveNotes from "@/pages/EnseignantReleveNotes";
import EnseignantAnnoncesPublier from "@/pages/EnseignantAnnoncesPublier";
import EnseignantEspacesClasses from "@/pages/EnseignantEspacesClasses";
import EnseignantRendezVous from "@/pages/EnseignantRendezVous";
import EnseignantRendezVousForm from "@/pages/EnseignantRendezVousForm";
import EnseignantCanalClasse from "@/pages/EnseignantCanalClasse";

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

              {/* ============================================================
                  ✅ ROUTES ADMIN (PHASE 2)
                  ============================================================ */}
              <Route path="/admin/demandes-role" element={<AdminDemandesRole />} />
              <Route path="/admin/demandes-etablissements" element={<AdminDemandesEtablissements />} />
              <Route path="/admin/demandes-partenariats" element={<AdminDemandesPartenariats />} />
              <Route path="/admin/educmaster-config" element={<AdminEducMasterConfig />} />
              <Route path="/admin/utilisateurs" element={<AdminUtilisateurs />} />
              <Route path="/admin/scolarite" element={<AdminScolarite />} />

              {/* ============================================================
                  ✅ ROUTES ENSEIGNANT (PHASE 3)
                  ============================================================ */}
              <Route path="/enseignant/dashboard" element={<EnseignantDashboard />} />
              <Route path="/enseignant/mes-classes" element={<EnseignantMesClasses />} />
              <Route path="/enseignant/notes" element={<EnseignantNotes />} />
              <Route path="/enseignant/cahier-texte" element={<EnseignantCahierTexte />} />
              <Route path="/enseignant/releve-notes" element={<EnseignantReleveNotes />} />
              <Route path="/enseignant/annonces-publier" element={<EnseignantAnnoncesPublier />} />
              <Route path="/enseignant/espaces-classes" element={<EnseignantEspacesClasses />} />
              <Route path="/enseignant/rendez-vous" element={<EnseignantRendezVous />} />
              <Route path="/enseignant/rendez-vous-form" element={<EnseignantRendezVousForm />} />
              <Route path="/enseignant/canal-classe" element={<EnseignantCanalClasse />} />

              {/* Public Directories */}
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
