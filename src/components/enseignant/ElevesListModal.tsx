// /src/components/enseignant/ElevesListModal.tsx
// Modal d'affichage de la liste des élèves d'une classe

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, User, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Portal } from '@/components/ui/Portal';
import { Input } from '@/components/ui/Input';

interface ElevesListModalProps {
  visible: boolean;
  eleves: Array<{
    id?: string;
    nom: string;
    prenom: string;
    matricule?: string;
  }>;
  classeNom: string;
  classeId: string;
  classeType: 'officielle' | 'personnelle';
  onClose: () => void;
}

export default function ElevesListModal({
  visible,
  eleves,
  classeNom,
  classeId,
  classeType,
  onClose,
}: ElevesListModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  if (!visible) return null;

  const filteredEleves = eleves.filter((eleve) =>
    `${eleve.prenom} ${eleve.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewReleve = (eleve: any) => {
    onClose();
    const eleveId = eleve.id || `temp_${Date.now()}_${eleve.nom}`;
    navigate(`/enseignant/releve-notes?eleveId=${eleveId}&eleveNom=${encodeURIComponent(eleve.nom)}&elevePrenom=${encodeURIComponent(eleve.prenom)}&classeId=${classeId}&classeNom=${encodeURIComponent(classeNom)}&type=${classeType}`);
  };

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
            <h2 className="text-lg font-bold text-gray-800">Élèves - {classeNom}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Recherche */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-row items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un élève..."
                className="border-0 bg-transparent p-0 text-sm focus:ring-0"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="p-4 overflow-y-auto max-h-[calc(85vh-200px)]">
            {filteredEleves.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-400">
                  {searchQuery ? 'Aucun élève trouvé' : 'Aucun élève dans cette classe'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredEleves.map((item, index) => (
                  <Card key={item.id || index} className="p-3">
                    <div className="flex flex-row items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-schoolnet-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {item.prenom} {item.nom}
                        </p>
                        {item.matricule && (
                          <p className="text-xs text-gray-400">Matricule: {item.matricule}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleViewReleve(item)}
                        className="flex flex-row items-center gap-1.5 bg-schoolnet-primary text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-schoolnet-primary/90 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Relevé
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
