import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveEtablissement } from "@/hooks/useActiveEtablissement";
import { useMenuItems } from "@/hooks/useMenuItems";
import { UserRole } from "@/types/database.types";

interface LayoutProps {
  children: React.ReactNode;
}

// Dynamic Icon Component mapping Lucide icons dynamically
function DynamicIcon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Grid;
  return <IconComponent className={className} />;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    user, 
    activeRole, 
    setActiveRole, 
    availableRoles, 
    profile, 
    signOut 
  } = useAuth();
  
  const { 
    activeEtablissement, 
    allEtablissements, 
    switchToEtablissement,
    hasMultipleEtablissements 
  } = useActiveEtablissement();

  const { menuSections } = useMenuItems();
  
  const isPublicRoute = React.useMemo(() => {
    const publicPaths = [
      "/",
      "/login",
      "/etablissements",
      "/a-propos",
      "/comment-ca-marche",
      "/auto-inscription",
      "/legal",
      "/privacy",
      "/charte-eleve",
      "/charte-enseignant",
      "/charte-parent"
    ];
    const path = location.pathname;
    if (publicPaths.includes(path)) return true;
    if (path.startsWith("/etablissements/")) return true;
    if (path.startsWith("/public/")) return true;
    return false;
  }, [location.pathname]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobilePublicMenuOpen, setIsMobilePublicMenuOpen] = useState(false);

  const isActive = (path: string) => {
    try {
      const cleanPath = path.split("?")[0];
      return location.pathname === cleanPath;
    } catch {
      return location.pathname === path;
    }
  };

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    try {
      await setActiveRole(role);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  };

  const handleEtablissementChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const etabId = e.target.value;
    await switchToEtablissement(etabId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-layout">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm" id="global-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              {!isPublicRoute ? (
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-slate-100 transition-colors"
                  id="sidebar-toggle"
                >
                  <LucideIcons.Menu className="h-5 w-5" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsMobilePublicMenuOpen(!isMobilePublicMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-slate-100 transition-colors"
                  id="public-mobile-menu-toggle"
                >
                  {isMobilePublicMenuOpen ? (
                    <LucideIcons.X className="h-5 w-5" />
                  ) : (
                    <LucideIcons.Menu className="h-5 w-5" />
                  )}
                </button>
              )}
              
              <Link to="/" className="flex items-center gap-2.5 group" id="logo-link">
                <div className="p-2 rounded-xl bg-blue-600 text-white group-hover:bg-blue-700 transition-all">
                  <LucideIcons.GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                  SchoolNet <span className="text-emerald-500 font-medium text-sm">Official</span>
                </span>
              </Link>

              {/* Public Navigation Links */}
              {isPublicRoute && (
                <nav className="hidden lg:flex items-center gap-1 ml-4">
                  <Link
                    to="/etablissements"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                      isActive("/etablissements")
                        ? "bg-blue-50/70 text-blue-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                    }`}
                  >
                    Annuaire
                  </Link>
                  <Link
                    to="/a-propos"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                      isActive("/a-propos")
                        ? "bg-blue-50/70 text-blue-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                    }`}
                  >
                    À propos
                  </Link>
                  <Link
                    to="/comment-ca-marche"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                      isActive("/comment-ca-marche")
                        ? "bg-blue-50/70 text-blue-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                    }`}
                  >
                    Tarifs & Offres
                  </Link>
                </nav>
              )}
            </div>

             {/* Active School Selector in the Header (Only Visible inside Workspace) */}
            {user && !isPublicRoute && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100" id="header-etablissement-selector">
                <LucideIcons.Building2 className="h-4 w-4 text-slate-400" />
                <select
                  id="etab-select"
                  className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer max-w-[200px] truncate"
                  value={activeEtablissement?.id || ""}
                  onChange={handleEtablissementChange}
                >
                  {allEtablissements.length > 0 ? (
                    allEtablissements.map((etab) => (
                      <option key={etab.id} value={etab.id}>
                        {etab.nom}
                      </option>
                    ))
                  ) : (
                    <option value="">Aucun établissement</option>
                  )}
                </select>
              </div>
            )}

            {/* Right side navigation & Profile controls */}
            <div className="flex items-center gap-3">
              {/* PUBLIC WORKFLOW (Portal / Info pages) */}
              {isPublicRoute ? (
                user ? (
                  /* 1. Logged-in on Public Portal -> Show only "Mon espace" button (Capture 4) */
                  <Link
                    id="nav-link-workspace"
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 hover:shadow-lg active:scale-[0.98]"
                  >
                    <LucideIcons.User className="h-3.5 w-3.5" />
                    <span>Mon espace</span>
                  </Link>
                ) : (
                  /* 2. Unauthenticated on Public Portal -> Show "Connexion" (Outline) & "Inscription" (Solid) (Capture 1) */
                  <div className="flex items-center gap-2">
                    <Link
                      id="nav-link-login-public"
                      to="/login"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 border border-blue-600/30 hover:border-blue-600 hover:bg-blue-50/50 transition-all"
                    >
                      <LucideIcons.LogIn className="h-3.5 w-3.5" />
                      <span>Connexion</span>
                    </Link>
                    <Link
                      id="nav-link-signup-public"
                      to="/auto-inscription"
                      className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                    >
                      <span>Inscription</span>
                    </Link>
                  </div>
                )
              ) : (
                /* PRIVATE WORKFLOW (Internal Workspace / Dashboard) */
                user && (
                  <>
                    {/* Interactive Demo Role Selector */}
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100" id="demo-role-selector">
                      <LucideIcons.ShieldAlert className="h-3.5 w-3.5 text-amber-600 hidden md:block" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 hidden lg:inline">Simulation :</span>
                      <select
                        id="demo-role-select"
                        className="bg-transparent border-none text-xs font-bold text-amber-800 focus:outline-none cursor-pointer"
                        value={activeRole || ""}
                        onChange={handleRoleChange}
                      >
                        {availableRoles.map((role) => (
                          <option key={role.role} value={role.role}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notification Bell */}
                    <button 
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all relative"
                      id="btn-notifications-bell"
                    >
                      <LucideIcons.Bell className="h-4.5 w-4.5" />
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full border border-white animate-pulse" />
                    </button>

                    {/* "Accueil" Button leading back to public portal (Capture 3) */}
                    <Link
                      id="nav-link-home-portal"
                      to="/"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
                    >
                      <LucideIcons.Home className="h-4 w-4 text-slate-400" />
                      <span className="hidden sm:inline">Accueil</span>
                    </Link>

                    {/* Profile Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                        id="user-profile-button"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {profile?.prenom?.charAt(0) || "U"}
                        </div>
                        <span className="hidden md:inline text-xs font-medium text-slate-700">
                          {profile?.prenom} {profile?.nom}
                        </span>
                        <LucideIcons.ChevronDown className="h-3 w-3 text-slate-500" />
                      </button>

                      {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-3.5 py-2 border-b border-slate-50">
                            <p className="text-xs text-slate-400">Connecté en tant que</p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{profile?.email || user.email}</p>
                          </div>
                          <button
                            onClick={async () => {
                              setIsProfileOpen(false);
                              await signOut();
                              navigate("/");
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                          >
                            <LucideIcons.LogOut className="h-4 w-4" />
                            Se déconnecter
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Public Mobile Sidebar Drawer */}
      {isPublicRoute && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className={`fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 lg:hidden transition-opacity duration-300 ${
              isMobilePublicMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsMobilePublicMenuOpen(false)}
          />

          {/* Sidebar Panel Drawer */}
          <nav 
            className={`
              fixed top-0 bottom-0 left-0 w-[280px] max-w-[80vw] bg-white z-50 lg:hidden
              flex flex-col p-5 shadow-2xl border-r border-slate-200 overflow-y-auto
              transition-transform duration-300 ease-out transform
              ${isMobilePublicMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                  <LucideIcons.GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900">
                  SchoolNet <span className="text-emerald-500 font-semibold text-xs">Official</span>
                </span>
              </div>
              <button 
                onClick={() => setIsMobilePublicMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <LucideIcons.X className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Links */}
            <div className="flex flex-col gap-1 shrink-0">
              <Link
                to="/etablissements"
                onClick={() => setIsMobilePublicMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                  isActive("/etablissements")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-800 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <LucideIcons.Compass className="h-4.5 w-4.5 text-slate-500" />
                <span>Annuaire</span>
              </Link>
              <Link
                to="/a-propos"
                onClick={() => setIsMobilePublicMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                  isActive("/a-propos")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-800 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <LucideIcons.Info className="h-4.5 w-4.5 text-slate-500" />
                <span>À propos</span>
              </Link>
              <Link
                to="/comment-ca-marche"
                onClick={() => setIsMobilePublicMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                  isActive("/comment-ca-marche")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-800 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <LucideIcons.Coins className="h-4.5 w-4.5 text-slate-500" />
                <span>Tarifs & Offres</span>
              </Link>
            </div>

            {/* Bottom Call to Actions */}
            <div className="mt-8 border-t border-slate-150 pt-4 flex flex-col gap-2 shrink-0">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobilePublicMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
                >
                  <LucideIcons.User className="h-4 w-4" />
                  <span>Mon espace</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobilePublicMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold text-blue-600 border border-blue-600/30 hover:bg-blue-50 transition-all"
                  >
                    <LucideIcons.LogIn className="h-4 w-4" />
                    <span>Connexion</span>
                  </Link>
                  <Link
                    to="/auto-inscription"
                    onClick={() => setIsMobilePublicMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <LucideIcons.UserPlus className="h-4 w-4" />
                    <span>Inscription</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </>
      )}

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto" id="app-container">
        
        {/* Dynamic Sidebar - Desktop & Mobile */}
        {user && !isPublicRoute && (
          <aside 
            className={`
              fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 pt-16 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:pt-0 md:h-[calc(100vh-4rem)] md:sticky md:top-16
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
            id="dynamic-sidebar"
          >
            {/* Scrollable menu content */}
            <div className="h-full overflow-y-auto px-4 py-6 space-y-6">
              
              {/* Mobile Active School Selector */}
              <div className="sm:hidden space-y-2 pb-4 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Établissement</span>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <LucideIcons.Building2 className="h-4 w-4 text-slate-400" />
                  <select
                    id="etab-select-mobile"
                    className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer w-full"
                    value={activeEtablissement?.id || ""}
                    onChange={handleEtablissementChange}
                  >
                    {allEtablissements.map((etab) => (
                      <option key={etab.id} value={etab.id}>
                        {etab.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {menuSections.map((section, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                    {section.title}
                  </h3>
                  <nav className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                          flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all group
                          ${isActive(item.href) 
                            ? "bg-blue-50/70 text-blue-600 font-bold" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <DynamicIcon name={item.icon} className={`h-4 w-4 ${isActive(item.href) ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-rose-500 text-white animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Content Backdrop for Mobile sidebar */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm md:hidden"
            id="sidebar-backdrop"
          />
        )}

        {/* Main Workspace Frame */}
        <main className="flex-1 min-w-0 bg-white" id="main-content-workspace">
          <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {children}
          </div>
        </main>

      </div>

      {/* Premium Multi-Column Footer */}
      <footer className="bg-white border-t border-slate-100 pt-10 pb-6 z-10 text-left" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white w-fit">
                  <LucideIcons.GraduationCap className="h-4.5 w-4.5" />
                </div>
                <span className="font-black text-sm text-slate-800 tracking-tight">SchoolNet</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Plateforme scolaire unifiée, connectée et d'excellence dédiée à la réussite académique de la jeunesse.
              </p>
            </div>

            {/* Column 2: Directory */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Annuaire & Services</h4>
              <ul className="space-y-1 text-xs font-medium">
                <li><Link to="/etablissements" className="text-slate-500 hover:text-blue-600 transition-colors">Rechercher une école</Link></li>
                <li><Link to="/auto-inscription" className="text-slate-500 hover:text-blue-600 transition-colors">Inscrire mon établissement</Link></li>
                <li><Link to="/comment-ca-marche" className="text-slate-500 hover:text-blue-600 transition-colors">Nos Tarifs d'affiliation</Link></li>
              </ul>
            </div>

            {/* Column 3: Chartes */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chartes de Confiance</h4>
              <ul className="space-y-1 text-xs font-medium">
                <li><Link to="/charte-eleve" className="text-slate-500 hover:text-blue-600 transition-colors">Charte de l'Élève</Link></li>
                <li><Link to="/charte-enseignant" className="text-slate-500 hover:text-blue-600 transition-colors">Charte de l'Enseignant</Link></li>
                <li><Link to="/charte-parent" className="text-slate-500 hover:text-blue-600 transition-colors">Charte du Parent</Link></li>
              </ul>
            </div>

            {/* Column 4: Légal */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Souveraineté & Légal</h4>
              <ul className="space-y-1 text-xs font-medium">
                <li><Link to="/legal" className="text-slate-500 hover:text-blue-600 transition-colors">Mentions Légales</Link></li>
                <li><Link to="/privacy" className="text-slate-500 hover:text-blue-600 transition-colors">Confidentialité (CDP)</Link></li>
                <li><Link to="/a-propos" className="text-slate-500 hover:text-blue-600 transition-colors">Notre Mission d'Excellence</Link></li>
              </ul>
            </div>
          </div>

          {/* Sub footer */}
          <div className="border-t border-slate-50 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-medium">
            <p>SchoolNet Official &copy; 2026. Tous droits réservés.</p>
            <p className="text-right">Souveraineté des Données Scolaires Sécurisée.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
