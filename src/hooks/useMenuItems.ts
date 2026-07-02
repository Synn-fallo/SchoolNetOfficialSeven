// /home/project/src/hooks/useMenuItems.ts
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBadges } from "@/hooks/useBadges";
import { useActiveEtablissement } from "@/hooks/useActiveEtablissement";
import { MenuSection } from "@/types/sidebar.types";
import { useNominationContext } from "@/contexts/NominationContext";
import { useDelegationContext } from "@/contexts/DelegationContext";

// ============================================================
// DÉFINITION DES MENUS PAR RÔLE (SANS "Personnel" ni "Mon profil")
// ============================================================

const menusByRole: Record<string, MenuSection[]> = {
  visiteur: [
    {
      title: "Navigation",
      items: [
        { id: "public", icon: "Home", label: "Accueil", href: "/" },
        { id: "demandes", icon: "FileText", label: "Mes demandes", href: "/mes-demandes" },
        { id: "auto-inscription", icon: "FileText", label: "S'inscrire dans un établissement", href: "/auto-inscription" },
      ],
    },
  ],
  eleve: [
    {
      title: "Principal",
      items: [
        { id: "accueil", icon: "Home", label: "Accueil", href: "/" },
        { id: "notes", icon: "BookOpen", label: "Mes notes", href: "/notes" },
        { id: "classe", icon: "Users", label: "Ma classe", href: "/classe" },
        { id: "messages", icon: "MessageSquare", label: "Messages", href: "/messages" },
      ],
    },
    {
      title: "Information",
      items: [
        { id: "annonces", icon: "Megaphone", label: "Annonces", href: "/annonces" },
      ],
    },
    {
      title: "Auto-inscription",
      items: [
        { id: "auto-inscription-eleve", icon: "FileText", label: "M'inscrire dans un établissement", href: "/auto-inscription" },
      ],
    },
  ],
  parent: [
    {
      title: "Principal",
      items: [
        { id: "dashboard", icon: "LayoutDashboard", label: "Tableau de bord", href: "/dashboard" },
        { id: "enfants", icon: "Users", label: "Mes enfants", href: "/enfants" },
        { id: "paiements", icon: "DollarSign", label: "Paiements", href: "/paiements" },
        { id: "auto-inscription-parent", icon: "FileText", label: "Inscrire mon enfant", href: "/auto-inscription" },
      ],
    },
    {
      title: "Classe",
      items: [
        { id: "espaces-classes", icon: "MessageCircle", label: "Espace classes", href: "/espaces-classes" },
      ],
    },
    {
      title: "Communication",
      items: [
        { id: "messages", icon: "MessageSquare", label: "Messages", href: "/messages" },
        { id: "rendez-vous", icon: "Calendar", label: "Rendez-vous", href: "/rendez-vous" },
        { id: "annonces", icon: "Megaphone", label: "Annonces", href: "/parent/annonces" },
      ],
    },
    {
      title: "Contrôle",
      items: [
        { id: "parental-controls", icon: "Shield", label: "Contrôles parentaux", href: "/parental-controls" },
      ],
    },
  ],
  enseignant: [
    {
      title: "Tableau de bord",
      items: [
        { id: "dashboard", icon: "LayoutDashboard", label: "Tableau de bord", href: "/dashboard" },
      ],
    },
    {
      title: "Classe",
      items: [
        { id: "espaces-classes", icon: "MessageCircle", label: "Espace classes", href: "/espaces-classes" },
      ],
    },
    {
      title: "Pédagogie",
      items: [
        { id: "classes", icon: "Users", label: "Mes classes", href: "/enseignant/mes-classes" },
        { id: "notes", icon: "BookOpen", label: "Évaluations & Notes", href: "/enseignant/notes" },
        { id: "cahier-texte", icon: "BookOpen", label: "Cahier de texte", href: "/enseignant/cahier-texte" },
        { id: "releve-notes", icon: "GraduationCap", label: "Relevés de notes", href: "/enseignant/releve-notes" },
      ],
    },
    {
      title: "Communication",
      items: [
        { id: "messages", icon: "MessageSquare", label: "Messages", href: "/messages" },
        { id: "rendez-vous", icon: "Calendar", label: "Rendez-vous parents", href: "/enseignant/rendez-vous" },
        { id: "publier-annonce", icon: "Megaphone", label: "Publier une annonce", href: "/enseignant/annonces-publier" },
        { id: "canal-classe", icon: "MessageCircle", label: "Canal de classe", href: "/enseignant/canal-classe" },
      ],
    },
  ],
  chef_etablissement: [
    {
      title: "Tableau de bord",
      items: [
        { id: "dashboard", icon: "LayoutDashboard", label: "Dashboard", href: "/dashboard" },
        { id: "scolarite", icon: "DollarSign", label: "Scolarité & Finance", href: "/scolarite" },
        { id: "notes", icon: "BookOpen", label: "Notes", href: "/notes" },
      ],
    },
    {
      title: "Supervision",
      items: [
        { id: "suivi-cours", icon: "Clock", label: "Suivi des cours", href: "/suivi-cours" },
        { id: "communication-officielle", icon: "Megaphone", label: "Communication officielle", href: "/communication-officielle" },
      ],
    },
    {
      title: "Gestion des élèves",
      items: [
        { id: "eleves", icon: "Users", label: "Élèves", href: "/eleves" },
        { id: "ajouter-eleve", icon: "UserPlus", label: "Ajouter un élève", href: "/eleves/ajouter" },
        { id: "demandes-auto-inscription", icon: "FileText", label: "Demandes auto-inscription", href: "/demandes-auto-inscription" },
      ],
    },
    {
      title: "Gestion des enseignants",
      items: [
        { id: "enseignants", icon: "Users", label: "Enseignants", href: "/enseignants" },
        { id: "invitations", icon: "Mail", label: "Invitations", href: "/enseignants/invitations" },
        { id: "delegations", icon: "UserCheck", label: "Délégations", href: "/delegations" },
      ],
    },
    {
      title: "Gestion des classes",
      items: [
        { id: "classes", icon: "Users", label: "Classes", href: "/classes" },
        { id: "groupes", icon: "Users", label: "Groupes", href: "/classes/groupes" },
      ],
    },
    {
      title: "Mes établissements",
      items: [
        { id: "mes-etablissements", icon: "Building2", label: "Mes établissements", href: "/mes-etablissements" },
      ],
    },
    {
      title: "Paramètres",
      items: [
        { id: "parametres", icon: "Settings", label: "Paramètres", href: "/parametres" },
      ],
    },
  ],
  admin: [
    {
      title: "Tableau de bord",
      items: [
        { id: "dashboard", icon: "LayoutDashboard", label: "Dashboard", href: "/dashboard" },
        { id: "etablissements", icon: "Building2", label: "Établissements", href: "/etablissements" },
        { id: "utilisateurs", icon: "Users", label: "Utilisateurs", href: "/admin/utilisateurs" },
        { id: "finance", icon: "DollarSign", label: "Finance", href: "/finance" },
      ],
    },
    {
      title: "Gestion des enseignants",
      items: [
        { id: "enseignants", icon: "Users", label: "Enseignants", href: "/enseignants" },
        { id: "invitations", icon: "Mail", label: "Invitations", href: "/enseignants/invitations" },
      ],
    },
    {
      title: "Gestion des demandes",
      items: [
        { id: "demandes-roles", icon: "Users", label: "Demandes de rôles", href: "/admin/demandes-role" },
        { id: "demandes-etablissements", icon: "FileText", label: "Demandes établissements", href: "/admin/demandes-etablissements" },
        { id: "demandes-partenariats", icon: "Handshake", label: "Demandes partenariats", href: "/admin/demandes-partenariats" },
      ],
    },
    {
      title: "Paramètres",
      items: [
        { id: "educmaster-config", icon: "Settings", label: "Configuration EducMaster", href: "/admin/educmaster-config" },
      ],
    },
  ],
  autorite: [
    {
      title: "Supervision",
      items: [
        { id: "dashboard-autorite", icon: "LayoutDashboard", label: "Tableau de bord", href: "/autorite/dashboard" },
        { id: "etablissements", icon: "Building2", label: "Établissements", href: "/autorite/etablissements" },
        { id: "demandes", icon: "FileText", label: "Demandes", href: "/autorite/demandes" },
        { id: "statistiques", icon: "BarChart", label: "Statistiques", href: "/autorite/statistiques" },
        { id: "rapports", icon: "FileText", label: "Rapports", href: "/autorite/rapports" },
      ],
    },
  ],
  partenaire: [
    {
      title: "Partenariat",
      items: [
        { id: "dashboard-partenaire", icon: "LayoutDashboard", label: "Tableau de bord", href: "/partenaire/dashboard" },
        { id: "etablissements", icon: "Building2", label: "Établissements partenaires", href: "/partenaire/etablissements" },
        { id: "offres", icon: "Gift", label: "Mes offres", href: "/partenaire/offres" },
        { id: "demandes", icon: "FileText", label: "Demandes", href: "/partenaire/demandes" },
        { id: "rapports", icon: "FileText", label: "Rapports", href: "/partenaire/rapports" },
      ],
    },
  ],
};

// ============================================================
// MENUS DES FONCTIONS SPÉCIALISÉES (membre_administratif)
// ============================================================

const deSections: MenuSection[] = [
  {
    title: "Pilotage pédagogique",
    items: [
      { id: "dashboard-de", icon: "LayoutDashboard", label: "Tableau de bord", href: "/dashboard-de" },
      { id: "classes", icon: "Users", label: "Classes", href: "/classes" },
      { id: "groupes", icon: "Users", label: "Groupes", href: "/classes/groupes" },
      { id: "matieres", icon: "BookOpen", label: "Matières", href: "/matieres" },
    ],
  },
  {
    title: "Gestion des élèves",
    items: [
      { id: "eleves", icon: "Users", label: "Élèves", href: "/eleves" },
      { id: "ajouter-eleve", icon: "UserPlus", label: "Ajouter un élève", href: "/eleves/ajouter" },
      { id: "demandes-auto-inscription", icon: "FileText", label: "Demandes auto-inscription", href: "/demandes-auto-inscription" },
      { id: "absences", icon: "CalendarX", label: "Absences", href: "/absences" },
      { id: "incidents", icon: "AlertTriangle", label: "Incidents", href: "/incidents" },
      { id: "discipline", icon: "Gavel", label: "Discipline", href: "/discipline" },
    ],
  },
  {
    title: "Gestion des enseignants",
    items: [
      { id: "enseignants", icon: "Users", label: "Enseignants", href: "/enseignants" },
      { id: "invitations", icon: "Mail", label: "Invitations", href: "/enseignants/invitations" },
      { id: "delegations", icon: "UserCheck", label: "Délégations", href: "/delegations" },
    ],
  },
  {
    title: "Suivi pédagogique",
    items: [
      { id: "notes-consultation", icon: "BookOpen", label: "Notes (consultation)", href: "/notes" },
      { id: "bulletins", icon: "FileText", label: "Bulletins", href: "/bulletins" },
      { id: "emplois", icon: "Calendar", label: "Emplois du temps", href: "/emplois" },
      { id: "suivi-cours", icon: "Clock", label: "Suivi des cours", href: "/suivi-cours" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { id: "parametres", icon: "Settings", label: "Paramètres", href: "/parametres" },
    ],
  },
];

const aeSections: MenuSection[] = [
  {
    title: "Mon département",
    items: [
      { id: "dashboard", icon: "LayoutDashboard", label: "Tableau de bord", href: "/dashboard" },
      { id: "enseignants", icon: "Chalkboard", label: "Enseignants", href: "/enseignants" },
      { id: "classes", icon: "Users", label: "Classes", href: "/classes" },
      { id: "groupes", icon: "Users", label: "Groupes", href: "/classes/groupes" },
      { id: "notes", icon: "BookOpen", label: "Notes", href: "/notes" },
    ],
  },
  {
    title: "Invitations",
    items: [
      { id: "invitations", icon: "Mail", label: "Mes invitations", href: "/enseignants/invitations" },
    ],
  },
];

const adminSections: MenuSection[] = [
  {
    title: "Gestion",
    items: [
      { id: "dashboard", icon: "LayoutDashboard", label: "Tableau de bord", href: "/dashboard" },
      { id: "inscriptions", icon: "FileText", label: "Inscriptions", href: "/inscriptions" },
      { id: "paiements", icon: "DollarSign", label: "Paiements", href: "/paiements" },
      { id: "factures", icon: "Receipt", label: "Factures", href: "/factures" },
    ],
  },
];

const vieScolaireSections: MenuSection[] = [
  {
    title: "Vie scolaire",
    items: [
      { id: "dashboard", icon: "LayoutDashboard", label: "Tableau de bord", href: "/dashboard" },
      { id: "absences", icon: "CalendarX", label: "Absences", href: "/absences" },
      { id: "incidents", icon: "AlertTriangle", label: "Incidents", href: "/incidents" },
      { id: "discipline", icon: "Gavel", label: "Discipline", href: "/discipline" },
    ],
  },
];

const assistantComptableSections: MenuSection[] = [
  {
    title: "Encaissements",
    items: [
      { id: "nouveau-paiement", icon: "CreditCard", label: "Nouveau paiement", href: "/nouveau-paiement" },
      { id: "recus", icon: "Receipt", label: "Reçus", href: "/recus" },
      { id: "historique-encaissements", icon: "History", label: "Historique", href: "/historique-encaissements" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { id: "parametres-caissier", icon: "Settings", label: "Paramètres", href: "/parametres-caissier" },
    ],
  },
];

const comptableSections: MenuSection[] = [
  {
    title: "Finances",
    items: [
      { id: "dashboard-comptable", icon: "LayoutDashboard", label: "Tableau de bord", href: "/dashboard-comptable" },
      { id: "encaissements", icon: "DollarSign", label: "Encaissements", href: "/encaissements" },
      { id: "depots-bancaires", icon: "Building2", label: "Dépôts bancaires", href: "/depots-bancaires" },
      { id: "rapprochement", icon: "RefreshCw", label: "Rapprochement", href: "/rapprochement" },
    ],
  },
  {
    title: "Comptabilité",
    items: [
      { id: "etats-financiers", icon: "FileText", label: "États financiers", href: "/etats-financiers" },
      { id: "balance", icon: "Scale", label: "Balance générale", href: "/balance" },
      { id: "grand-livre", icon: "Book", label: "Grand livre", href: "/grand-livre" },
    ],
  },
  {
    title: "Gestion",
    items: [
      { id: "factures", icon: "Receipt", label: "Factures", href: "/factures" },
      { id: "fournisseurs", icon: "Truck", label: "Fournisseurs", href: "/fournisseurs" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { id: "parametres-comptables", icon: "Settings", label: "Paramètres", href: "/parametres-comptables" },
    ],
  },
];

const caissierSections: MenuSection[] = [
  {
    title: "Encaissements",
    items: [
      { id: "nouveau-paiement", icon: "CreditCard", label: "Nouveau paiement", href: "/nouveau-paiement" },
      { id: "recus", icon: "Receipt", label: "Reçus", href: "/recus" },
      { id: "historique-encaissements", icon: "History", label: "Historique", href: "/historique-encaissements" },
    ],
  },
  {
    title: "Clôture",
    items: [
      { id: "cloture-caisse", icon: "Lock", label: "Clôture caisse", href: "/cloture-caisse" },
      { id: "bordereau-versement", icon: "FileText", label: "Bordereau de versement", href: "/bordereau-versement" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { id: "parametres-caissier", icon: "Settings", label: "Paramètres", href: "/parametres-caissier" },
    ],
  },
];

// ============================================================
// MAPPING DES MENUS PAR RÔLE DE DÉLÉGATION/NOMINATION
// ============================================================

const delegationMenuMap: Record<string, MenuSection[]> = {
  caissier: caissierSections,
  assistant_comptable: assistantComptableSections,
  comptable: comptableSections,
  ae: aeSections,
  de: deSections,
  personnel_administratif: adminSections,
  personnel_vie_scolaire: vieScolaireSections,
};

// ============================================================
// HELPER
// ============================================================

const addEtablissementIdToUrl = (href: string, etablissementId?: string): string => {
  if (!etablissementId) return href;
  
  const gestionPages = [
    "/classes", "/notes", "/scolarite", 
    "/enseignants", "/invitations", "/delegations",
    "/groupes", "/devoirs", "/inscriptions", "/paiements", "/factures",
    "/etablissement/gestion", "/etablissement/preview", "/etablissement/abonnement",
    "/parametres", "/demandes-auto-inscription"
  ];
  
  const shouldAddId = gestionPages.some(page => href.includes(page));
  if (!shouldAddId) return href;
  
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}id=${etablissementId}`;
};

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export function useMenuItems() {
  const { 
    activeRole, 
    user,
    adminType,
    perimetre,
    partenariatEtablissements
  } = useAuth();
  
  const { activeDelegatedRoles } = useDelegationContext();
  const { activeNominatedRoles } = useNominationContext();
  
  const { 
    messagesBadge, 
    demandesBadge, 
    invitationsBadge, 
    demandesAutoInscriptionBadge
  } = useBadges();
  
  const { activeEtablissement } = useActiveEtablissement();
  
  const etablissementId = activeEtablissement?.id;

  const menuSections = useMemo(() => {
    if (!user) return [];

    let sections: MenuSection[] = [];

    // Select based on activeRole
    const rawRole = activeRole || "visiteur";
    const baseSections = menusByRole[rawRole] || menusByRole.visiteur;
    
    // Deep copy to avoid mutating original arrays
    sections = JSON.parse(JSON.stringify(baseSections));

    // Special administrative structures - only visible when logged in as membre_administratif
    if (adminType && rawRole === "membre_administratif") {
      let adminSectionsToAdd: MenuSection[] = [];
      switch (adminType) {
        case "de":
          adminSectionsToAdd = deSections;
          break;
        case "ae":
          adminSectionsToAdd = aeSections;
          break;
        case "administratif":
          adminSectionsToAdd = adminSections;
          break;
        case "vie_scolaire":
          adminSectionsToAdd = vieScolaireSections;
          break;
        case "comptable":
          adminSectionsToAdd = comptableSections;
          break;
        case "caissier":
          adminSectionsToAdd = caissierSections;
          break;
      }
      
      for (const adminSection of adminSectionsToAdd) {
        const existingSection = sections.find(s => s.title === adminSection.title);
        if (existingSection) {
          existingSection.items = [...existingSection.items, ...JSON.parse(JSON.stringify(adminSection.items))];
        } else {
          sections.push(JSON.parse(JSON.stringify(adminSection)));
        }
      }
    }

    // Delegations & Nominations are only visible when in professional/staff roles (excluding teacher)
    const isProfessionalRole = ["membre_administratif", "chef_etablissement"].includes(rawRole);

    if (isProfessionalRole) {
      // Delegation additions
      for (const delegatedRole of activeDelegatedRoles) {
        const delegatedMenus = delegationMenuMap[delegatedRole];
        if (delegatedMenus) {
          for (const menuSection of delegatedMenus) {
            const existingSection = sections.find(s => s.title === menuSection.title);
            if (existingSection) {
              const existingItemIds = new Set(existingSection.items.map(i => i.id));
              const newItems = menuSection.items.filter(item => !existingItemIds.has(item.id));
              existingSection.items = [...existingSection.items, ...JSON.parse(JSON.stringify(newItems))];
            } else {
              sections.push(JSON.parse(JSON.stringify(menuSection)));
            }
          }
        }
      }

      // Nomination additions
      for (const nominatedRole of activeNominatedRoles) {
        let menuRole = nominatedRole;
        if (nominatedRole === "de") menuRole = "de";
        else if (nominatedRole === "ae") menuRole = "ae";
        else if (nominatedRole === "comptable") menuRole = "comptable";
        else if (nominatedRole === "caissier") menuRole = "caissier";
        else if (nominatedRole === "assistant_comptable") menuRole = "assistant_comptable";
        else if (nominatedRole === "administratif") menuRole = "personnel_administratif";
        else if (nominatedRole === "vie_scolaire") menuRole = "personnel_vie_scolaire";

        const nominatedMenus = delegationMenuMap[menuRole];
        if (nominatedMenus) {
          for (const menuSection of nominatedMenus) {
            const existingSection = sections.find(s => s.title === menuSection.title);
            if (existingSection) {
              const existingItemIds = new Set(existingSection.items.map(i => i.id));
              const newItems = menuSection.items.filter(item => !existingItemIds.has(item.id));
              existingSection.items = [...existingSection.items, ...JSON.parse(JSON.stringify(newItems))];
            } else {
              sections.push(JSON.parse(JSON.stringify(menuSection)));
            }
          }
        }
      }
    }

    if (activeRole === "autorite") {
      console.log("📋 Autorité - Périmètre:", perimetre);
    }

    if (activeRole === "partenaire") {
      console.log("📋 Partenaire - Établissements partenaires:", partenariatEtablissements?.length || 0);
    }

    // Append school identifiers to managing links
    const sectionsWithIds = sections.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        href: addEtablissementIdToUrl(item.href, etablissementId),
      })),
    }));

    // Inject live badges into appropriate items
    const sectionsWithBadges = sectionsWithIds.map(section => ({
      ...section,
      items: section.items.map(item => {
        let badge = item.badge;
        
        if (item.id === "messages" && messagesBadge > 0) {
          badge = messagesBadge;
        }
        if (item.id === "demandes-etablissements" && demandesBadge > 0) {
          badge = demandesBadge;
        }
        if ((item.id === "invitations" || item.id === "enseignants") && invitationsBadge > 0) {
          badge = invitationsBadge;
        }
        if (item.id === "demandes-auto-inscription" && demandesAutoInscriptionBadge > 0) {
          badge = demandesAutoInscriptionBadge;
        }
        
        return { ...item, badge };
      }),
    }));

    return sectionsWithBadges;
  }, [
    activeRole, 
    user, 
    adminType,
    perimetre,
    partenariatEtablissements,
    messagesBadge, 
    demandesBadge, 
    invitationsBadge, 
    demandesAutoInscriptionBadge,
    etablissementId,
    activeDelegatedRoles,
    activeNominatedRoles
  ]);

  return { menuSections };
}
