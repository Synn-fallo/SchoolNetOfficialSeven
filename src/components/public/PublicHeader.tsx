import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, User, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface PublicHeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export default function PublicHeader({ onSearch, showSearch = true }: PublicHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Annuaire', href: '/public/etablissements' },
    { name: 'À propos', href: '/public/a-propos' },
    { name: 'Comment ça marche', href: '/public/comment-ca-marche' },
  ];

  return (
    <>
      {/* Header flottant avec effet de flou */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-xl bg-schoolnet-primary text-white group-hover:bg-schoolnet-primary-light transition-all duration-300 shadow-glow">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-gray-900 group-hover:text-schoolnet-primary transition-colors">
                  SchoolNet
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider">
                  Éducation connectée
                </span>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="relative text-sm font-medium text-gray-600 hover:text-schoolnet-primary transition-colors group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-schoolnet-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-schoolnet-primary text-white font-medium text-sm hover:bg-schoolnet-primary-light transition-all duration-300 shadow-soft hover:shadow-glow group"
                >
                  <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Mon espace</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:border-schoolnet-primary hover:text-schoolnet-primary hover:bg-blue-50 transition-all duration-300"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Connexion</span>
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-schoolnet-primary text-white font-medium text-sm hover:bg-schoolnet-primary-light transition-all duration-300 shadow-soft hover:shadow-glow"
                  >
                    Inscription
                  </button>
                </>
              )}

              {/* Menu Mobile */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Navigation Mobile */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-schoolnet-primary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <button
                  onClick={() => {
                    navigate('/register');
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-schoolnet-primary text-white hover:bg-schoolnet-primary-light transition-colors"
                >
                  Inscription
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Espace pour compenser le header fixe */}
      <div className="h-16" />
    </>
  );
}