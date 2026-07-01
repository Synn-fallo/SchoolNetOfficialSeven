// /src/components/enseignant/ReleveNotesView.tsx
// Vue principale du relevé de notes

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, PlusCircle, Calendar, Download } from 'lucide-react';
import { ReleveData, PeriodeType } from '@/types/releve.types';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { exportReleveToCSV } from '@/utils/exportCSV';
import ReleveNotesStandard from './ReleveNotesStandard';
import ReleveNotesPremium from './ReleveNotesPremium';
import UpgradeBanner from './UpgradeBanner';
import PeriodSelector from './PeriodSelector';
import { Card } from '@/components/ui/Card';

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  matricule?: string;
}

interface Props {
  releve: ReleveData;
  eleveNom: string;
  elevePrenom: string;
  classeNom: string;
  classeId: string;
  type: 'officielle' | 'personnelle';
  selectedPeriode: PeriodeType;
  onPeriodeChange: (p: PeriodeType) => void;
  onRefresh: () => void;
  elevesList?: Eleve[];
  onEleveChange?: (eleveId: string, eleveNom: string, elevePrenom: string) => void;
  currentEleveId?: string;
  onCreateEvaluation?: () => void;
}

export default function ReleveNotesView({
  releve,
  eleveNom,
  elevePrenom,
  classeNom,
  classeId,
  type,
  selectedPeriode,
  onPeriodeChange,
  onRefresh,
  elevesList = [],
  onEleveChange,
  currentEleveId,
  onCreateEvaluation,
}: Props) {
  const { isAffiliated } = useAuth();
  const { hasActiveSubscription } = useSubscriptionCheck();
  const isPremium = isAffiliated && hasActiveSubscription;
  const [showEleveModal, setShowEleveModal] = useState(false);

  const hasNotes = releve?.matieres?.some(m => m.evaluations?.some(e => e.note > 0)) || false;
  const hasEvaluations = releve?.matieres?.length > 0 || false;

  const currentIndex = elevesList.findIndex(e => e.id === currentEleveId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < elevesList.length - 1;

  const handlePreviousEleve = () => {
    if (hasPrevious && onEleveChange) {
      const prevEleve = elevesList[currentIndex - 1];
      onEleveChange(prevEleve.id, prevEleve.nom, prevEleve.prenom);
    }
  };

  const handleNextEleve = () => {
    if (hasNext && onEleveChange) {
      const nextEleve = elevesList[currentIndex + 1];
      onEleveChange(nextEleve.id, nextEleve.nom, nextEleve.prenom);
    }
  };

  const handleSelectEleve = (eleve: Eleve) => {
    if (onEleveChange) {
      onEleveChange(eleve.id, eleve.nom, eleve.prenom);
    }
    setShowEleveModal(false);
  };

  const handleExportCSV = () => {
    try {
      exportReleveToCSV(releve, eleveNom, elevePrenom);
      window.alert('Le fichier CSV a été exporté avec succès');
    } catch (error) {
      console.error('Erreur export CSV:', error);
      window.alert('Impossible d\'exporter le fichier CSV');
    }
  };

  const handleExportPDF = () => {
    console.log('Export PDF');
  };

  const handleExportExcel = () => {
    console.log('Export Excel');
  };

  const handlePrint = () => {
    window.print();
  };

  const renderEmptyState = () => (
    <Card className="m-4 p-8 text-center border border-gray-200">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune note pour cette période</h3>
      <p className="text-sm text-gray-500 mb-6">
        {!hasEvaluations 
          ? "Vous n'avez pas encore créé d'évaluation pour cette période."
          : "Les notes n'ont pas encore été saisies pour cette période."}
      </p>
      <div className="flex flex-row gap-3 justify-center flex-wrap">
        <button
          onClick={() => onPeriodeChange(selectedPeriode === 'S1' ? 'S2' : 'S1')}
          className="flex flex-row items-center gap-2 bg-schoolnet-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Changer de période
        </button>
        {onCreateEvaluation && (
          <button
            onClick={onCreateEvaluation}
            className="flex flex-row items-center gap-2 bg-white text-schoolnet-primary border border-schoolnet-primary px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Créer une évaluation
          </button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="flex-1 bg-gray-50">
      {/* Barre de navigation élèves + période */}
      {elevesList.length > 0 && onEleveChange && (
        <div className="bg-white border-b border-gray-200">
          <div className="flex flex-row items-center justify-between px-4 py-3">
            <button
              onClick={handlePreviousEleve}
              disabled={!hasPrevious}
              className={`
                flex flex-row items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${hasPrevious 
                  ? 'text-schoolnet-primary hover:bg-gray-100' 
                  : 'text-gray-300 cursor-not-allowed'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>

            <button
              onClick={() => setShowEleveModal(true)}
              className="flex flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Users className="w-4 h-4 text-schoolnet-primary" />
              <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                {elevePrenom} {eleveNom}
              </span>
            </button>

            <button
              onClick={handleNextEleve}
              disabled={!hasNext}
              className={`
                flex flex-row items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${hasNext 
                  ? 'text-schoolnet-primary hover:bg-gray-100' 
                  : 'text-gray-300 cursor-not-allowed'
                }
              `}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <PeriodSelector selectedPeriode={selectedPeriode} onPeriodeChange={onPeriodeChange} />
        </div>
      )}

      {elevesList.length === 0 && (
        <PeriodSelector selectedPeriode={selectedPeriode} onPeriodeChange={onPeriodeChange} />
      )}

      {/* Badge classe personnelle */}
      {type === 'personnelle' && (
        <div className="px-4 pt-3">
          <span className="bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-full">
            Personnel
          </span>
        </div>
      )}

      {/* Bouton Export CSV */}
      <div className="px-4 pt-3">
        <button
          onClick={handleExportCSV}
          className="w-full flex flex-row items-center justify-center gap-2 bg-schoolnet-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors mb-2"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Contenu principal */}
      <div className="flex-1">
        {!hasNotes || !hasEvaluations ? (
          renderEmptyState()
        ) : (
          <div>
            <ReleveNotesStandard
              releve={releve}
              eleveNom={eleveNom}
              elevePrenom={elevePrenom}
              classeNom={classeNom}
              type={type}
              selectedPeriode={selectedPeriode}
            />

            {isPremium ? (
              <ReleveNotesPremium
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                onPrint={handlePrint}
              />
            ) : (
              <UpgradeBanner />
            )}
          </div>
        )}
      </div>

      {/* Modal de sélection d'élève */}
      {showEleveModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowEleveModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Choisir un élève</h3>
              <button
                onClick={() => setShowEleveModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {elevesList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectEleve(item)}
                  className={`
                    w-full text-left px-5 py-3.5 border-b border-gray-100 transition-colors
                    ${currentEleveId === item.id 
                      ? 'bg-blue-50 text-schoolnet-primary' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <p className={`text-sm font-medium ${currentEleveId === item.id ? 'text-schoolnet-primary' : 'text-gray-700'}`}>
                    {item.prenom} {item.nom}
                  </p>
                  {item.matricule && (
                    <p className="text-xs text-gray-400">{item.matricule}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
