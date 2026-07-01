// /src/components/enseignant/ClasseDetailModal.tsx
// Modal d'affichage des détails d'une classe officielle

import React from 'react';
import { Building2, Users, GraduationCap, X, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Portal } from '@/components/ui/Portal';

interface ClasseDetailModalProps {
  visible: boolean;
  classe: {
    id: string;
    nom: string;
    niveau: string;
    effectif: number;
    etablissement_nom: string;
    enseignant_principal_nom?: string;
    matieres?: Array<{ id: string; nom: string; coefficient: number }>;
  } | null;
  onClose: () => void;
  onVoirEleves: () => void;
}

export default function ClasseDetailModal({
  visible,
  classe,
  onClose,
  onVoirEleves,
}: ClasseDetailModalProps) {
  if (!visible || !classe) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Détails de la classe</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
            {/* Informations */}
            <Card className="p-4 mb-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-row items-center gap-3 py-2 border-b border-gray-100">
                  <Building2 className="w-5 h-5 text-schoolnet-primary flex-shrink-0" />
                  <span className="text-sm text-gray-500 flex-1">Classe</span>
                  <span className="text-sm font-medium text-gray-800">{classe.nom}</span>
                </div>
                
                {classe.niveau && classe.niveau !== 'Non spécifié' && (
                  <div className="flex flex-row items-center gap-3 py-2 border-b border-gray-100">
                    <GraduationCap className="w-5 h-5 text-schoolnet-primary flex-shrink-0" />
                    <span className="text-sm text-gray-500 flex-1">Niveau</span>
                    <span className="text-sm font-medium text-gray-800">{classe.niveau}</span>
                  </div>
                )}
                
                <div className="flex flex-row items-center gap-3 py-2 border-b border-gray-100">
                  <Users className="w-5 h-5 text-schoolnet-primary flex-shrink-0" />
                  <span className="text-sm text-gray-500 flex-1">Effectif</span>
                  <span className="text-sm font-medium text-gray-800">{classe.effectif} élèves</span>
                </div>
                
                <div className="flex flex-row items-center gap-3 py-2 border-b border-gray-100">
                  <Building2 className="w-5 h-5 text-schoolnet-primary flex-shrink-0" />
                  <span className="text-sm text-gray-500 flex-1">Établissement</span>
                  <span className="text-sm font-medium text-gray-800">{classe.etablissement_nom}</span>
                </div>
                
                {classe.enseignant_principal_nom && (
                  <div className="flex flex-row items-center gap-3 py-2">
                    <GraduationCap className="w-5 h-5 text-schoolnet-primary flex-shrink-0" />
                    <span className="text-sm text-gray-500 flex-1">Professeur principal</span>
                    <span className="text-sm font-medium text-gray-800">{classe.enseignant_principal_nom}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Matières */}
            <Card className="p-4 mb-4">
              <div className="flex flex-row items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-schoolnet-primary" />
                <h3 className="text-sm font-semibold text-gray-700">Matières enseignées</h3>
              </div>
              
              {classe.matieres && classe.matieres.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {classe.matieres.map((matiere) => (
                    <div 
                      key={matiere.id} 
                      className="flex flex-row justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-700">{matiere.nom}</span>
                      <span className="text-xs font-medium text-schoolnet-primary bg-blue-50 px-2 py-0.5 rounded-full">
                        Coef {matiere.coefficient}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  Aucune matière définie pour cet établissement
                </p>
              )}
            </Card>

            {/* Bouton action */}
            <button
              onClick={onVoirEleves}
              className="w-full flex flex-row items-center justify-center gap-2 bg-schoolnet-primary hover:bg-schoolnet-primary/90 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <Users className="w-4 h-4" />
              Voir la liste des élèves
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
