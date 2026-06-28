import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com/schoolnet', label: 'Facebook' },
    { icon: Twitter, url: 'https://twitter.com/schoolnet', label: 'Twitter' },
    { icon: Linkedin, url: 'https://linkedin.com/company/schoolnet', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { name: 'Annuaire', href: '/public/etablissements' },
    { name: 'À propos', href: '/public/a-propos' },
    { name: 'Comment ça marche', href: '/public/comment-ca-marche' },
    { name: 'Mentions légales', href: '/public/legal' },
    { name: 'Confidentialité', href: '/public/privacy' },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-6 pb-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Colonne 1: Logo & Description */}
        <div className="col-span-2 md:col-span-1">
          <span className="text-xl font-bold text-schoolnet-primary">SchoolNet</span>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            La plateforme éducative qui connecte tous les acteurs de l'éducation.
          </p>
        </div>

        {/* Colonne 2: Liens rapides */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Liens rapides</h4>
          <div className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <Link key={link.name} to={link.href} className="text-sm text-gray-500 hover:text-schoolnet-primary transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Colonne 3: Contact */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Contact</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">contact@schoolnet.bj</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">+229 99 00 00 00</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">Cotonou, Bénin</span>
            </div>
          </div>
        </div>

        {/* Colonne 4: Réseaux sociaux */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Suivez-nous</h4>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label={social.label}
              >
                <social.icon size={18} className="text-gray-500" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 pt-4 text-center">
        <p className="text-xs text-gray-400">© {currentYear} SchoolNet. Tous droits réservés.</p>
      </div>
    </footer>
  );
}