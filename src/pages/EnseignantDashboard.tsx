// /src/pages/EnseignantDashboard.tsx
// Tableau de bord enseignant

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, BarChart, GraduationCap, MessageSquare, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function EnseignantDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const menuItems = [
    {
      id: 'mes-classes',
      title: 'Mes classes',
      description: 'Voir vos classes et élèves',
      icon: Users,
      color: '#3B82F6',
      href: '/enseignant/mes-classes',
    },
    {
      id: 'evaluations-notes',
      title: 'Évaluations & Notes',
      description: 'Créer des évaluations et saisir les notes',
      icon: BookOpen,
      color: '#10B981',
      href: '/enseignant/notes',
    },
    {
      id: 'releves',
      title: 'Relevés de notes',
      description: 'Consulter les relevés par élève',
      icon: GraduationCap,
      color: '#8B5CF6',
      href: '/enseignant/releve-notes',
      disabled: true,
    },
    {
      id: 'statistiques',
      title: 'Statistiques',
      description: 'Analyser les performances',
      icon: BarChart,
      color: '#F59E0B',
      href: '/enseignant/statistiques-classe',
      disabled: true,
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Communiquer avec la communauté',
      icon: MessageSquare,
      color: '#EF4444',
      href: '/messages',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 pb-8 max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">{getGreeting()},</p>
          <h1 className="text-3xl font-bold text-gray-800 mt-1">
            {profile?.prenom || user?.email?.split('@')[0] || 'Enseignant'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bienvenue sur votre espace enseignant
          </p>
        </div>

        {/* Menu principal */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Accès rapide</h2>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && navigate(item.href)}
                disabled={item.disabled}
                className={`
                  flex flex-row items-center gap-4 bg-white rounded-xl p-4 text-left
                  ${item.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md transition-shadow'}
                  border border-gray-200
                `}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon size={24} color={item.color} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${item.disabled ? 'text-gray-400' : 'text-gray-800'}`}>
                    {item.title}
                  </p>
                  <p className={`text-xs ${item.disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
                {item.disabled && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    Bientôt
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Calendrier */}
        <Card className="p-4">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Évaluations à venir</h2>
          <div className="py-6 text-center">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-400 mt-3">Aucune évaluation planifiée</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
