// /src/pages/EnseignantCahierTexte.tsx
// Cahier de texte enseignant

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Portal } from '@/components/ui/Portal';
import { Calendar, BookOpen, Clock, CheckCircle, AlertCircle, Plus, Eye, Edit2, Trash2, Send, X } from 'lucide-react';

// Données mockées
const MOCK_COURS_A_DECLARER = [
  {
    id: '1',
    date: '2026-05-02',
    horaireDebut: '08:00',
    horaireFin: '10:00',
    classe: '3e B',
    matiere: 'Mathématiques',
    salle: 'Salle 101',
  },
  {
    id: '2',
    date: '2026-05-02',
    horaireDebut: '10:00',
    horaireFin: '12:00',
    classe: '4e A',
    matiere: 'Mathématiques',
    salle: 'Salle 102',
  },
  {
    id: '3',
    date: '2026-05-03',
    horaireDebut: '08:00',
    horaireFin: '10:00',
    classe: '3e B',
    matiere: 'Mathématiques',
    salle: 'Salle 101',
  },
];

const MOCK_HISTORIQUE = [
  {
    id: 'h1',
    date: '2026-04-28',
    horaireDebut: '08:00',
    horaireFin: '10:00',
    classe: '3e B',
    matiere: 'Mathématiques',
    dureeReelle: '2h',
    contenu: 'Équations du second degré – Introduction',
    exercice: 'Exercices 1 à 5 page 42',
    statut: 'Normal',
    dateSaisie: '2026-04-28',
  },
  {
    id: 'h2',
    date: '2026-04-27',
    horaireDebut: '10:00',
    horaireFin: '12:00',
    classe: '4e A',
    matiere: 'Mathématiques',
    dureeReelle: '2h',
    contenu: 'Fonctions affines – Définition et exemples',
    exercice: 'Exercices 1 à 3 page 28',
    statut: 'Normal',
    dateSaisie: '2026-04-27',
  },
  {
    id: 'h3',
    date: '2026-04-26',
    horaireDebut: '08:00',
    horaireFin: '10:00',
    classe: '3e B',
    matiere: 'Mathématiques',
    dureeReelle: '2h',
    contenu: 'Révision – Polynômes',
    exercice: 'Série d\'exercices',
    statut: 'Tardif',
    dateSaisie: '2026-04-28',
  },
];

export default function EnseignantCahierTexte() {
  const navigate = useNavigate();
  const { user, profile, activeEtablissement, isAffiliated } = useAuth();
  const [activeTab, setActiveTab] = useState<'a-declarer' | 'historique'>('a-declarer');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCours, setSelectedCours] = useState<any>(null);
  const [formData, setFormData] = useState({
    dureeReelle: '',
    contenu: '',
    exercice: '',
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedHistorique, setSelectedHistorique] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    contenu: '',
    exercice: '',
  });

  const userName = profile?.prenom && profile?.nom 
    ? `${profile.prenom} ${profile.nom}` 
    : user?.email?.split('@')[0] || 'Enseignant';

  const handleDeclarer = (cours: any) => {
    setSelectedCours(cours);
    setFormData({ dureeReelle: '', contenu: '', exercice: '' });
    setModalVisible(true);
  };

  const handleSubmitDeclaration = () => {
    if (!formData.dureeReelle || !formData.contenu) {
      window.alert('Veuillez renseigner la durée réelle et le contenu du cours.');
      return;
    }
    window.alert('Votre déclaration a été enregistrée avec succès.');
    setModalVisible(false);
  };

  const handleViewDetail = (item: any) => {
    setSelectedHistorique(item);
    setDetailModalVisible(true);
  };

  const handleEdit = (item: any) => {
    setSelectedHistorique(item);
    setEditData({
      contenu: item.contenu,
      exercice: item.exercice || '',
    });
    setEditModalVisible(true);
  };

  const handleUpdateDeclaration = () => {
    window.alert('Votre déclaration a été mise à jour.');
    setEditModalVisible(false);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Normal': return 'text-emerald-600 bg-emerald-50';
      case 'Tardif': return 'text-amber-600 bg-amber-50';
      case 'Suspect': return 'text-red-600 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'Normal': return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Tardif': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case 'Suspect': return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* En-tête */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Mon cahier de texte</h1>
        <p className="text-sm text-gray-500">
          {userName} • {activeEtablissement?.nom || 'Établissement'}
        </p>
        {isAffiliated && (
          <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ✅ Enseignant affilié
          </span>
        )}
      </div>

      {/* Onglets */}
      <div className="flex flex-row bg-white border-b border-gray-200 px-4">
        <button
          onClick={() => setActiveTab('a-declarer')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'a-declarer'
              ? 'text-schoolnet-primary border-b-2 border-schoolnet-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          À déclarer ({MOCK_COURS_A_DECLARER.length})
        </button>
        <button
          onClick={() => setActiveTab('historique')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'historique'
              ? 'text-schoolnet-primary border-b-2 border-schoolnet-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historique
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4 max-w-3xl mx-auto">
        {activeTab === 'a-declarer' ? (
          MOCK_COURS_A_DECLARER.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tous les cours sont déclarés</h3>
              <p className="text-sm text-gray-500">Bravo ! Vous êtes à jour dans vos déclarations.</p>
            </Card>
          ) : (
            MOCK_COURS_A_DECLARER.map((cours) => (
              <Card key={cours.id} className="p-4 mb-3">
                <div className="flex flex-row justify-between items-center mb-3">
                  <div className="flex flex-row items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5 text-schoolnet-primary" />
                    <span className="text-xs font-medium text-schoolnet-primary">{formatDate(cours.date)}</span>
                  </div>
                  <span className="text-xs text-gray-500">{cours.horaireDebut} – {cours.horaireFin}</span>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-800">{cours.classe} • {cours.matiere}</p>
                  <p className="text-xs text-gray-400">📍 {cours.salle}</p>
                </div>
                <button
                  onClick={() => handleDeclarer(cours)}
                  className="w-full flex flex-row items-center justify-center gap-2 bg-schoolnet-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-schoolnet-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Déclarer ce cours
                </button>
              </Card>
            ))
          )
        ) : (
          MOCK_HISTORIQUE.map((item) => (
            <Card key={item.id} className="p-4 mb-3">
              <div className="flex flex-row justify-between items-center mb-2">
                <div className="flex flex-row items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <Calendar className="w-3.5 h-3.5 text-schoolnet-primary" />
                  <span className="text-xs font-medium text-schoolnet-primary">{formatDate(item.date)}</span>
                </div>
                <span className={`flex flex-row items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(item.statut)}`}>
                  {getStatutIcon(item.statut)}
                  {item.statut}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{item.classe} • {item.matiere}</p>
              <p className="text-xs text-gray-400">{item.horaireDebut} – {item.horaireFin} (durée réelle : {item.dureeReelle})</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.contenu}</p>
              {item.exercice && (
                <p className="text-xs text-gray-400 mt-1">📝 Devoir : {item.exercice}</p>
              )}
              <div className="flex flex-row gap-4 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleViewDetail(item)}
                  className="flex flex-row items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Eye className="w-4 h-4" />
                  Voir
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="flex flex-row items-center gap-1.5 text-xs text-schoolnet-primary hover:text-schoolnet-primary/80"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de déclaration */}
      {modalVisible && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Déclarer le cours</h3>
                <button onClick={() => setModalVisible(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                {selectedCours && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">{formatDate(selectedCours.date)} • {selectedCours.horaireDebut} – {selectedCours.horaireFin}</p>
                    <p className="text-sm font-medium text-gray-800">{selectedCours.classe} • {selectedCours.matiere}</p>
                    <p className="text-xs text-gray-400">📍 {selectedCours.salle}</p>
                  </div>
                )}
                
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Durée réelle du cours *</label>
                <Input
                  value={formData.dureeReelle}
                  onChange={(e) => setFormData(prev => ({ ...prev, dureeReelle: e.target.value }))}
                  placeholder="Ex: 2h, 1h30, etc."
                  className="mb-3"
                />

                <label className="text-sm font-medium text-gray-700 block mb-1.5">Contenu du cours *</label>
                <textarea
                  value={formData.contenu}
                  onChange={(e) => setFormData(prev => ({ ...prev, contenu: e.target.value }))}
                  placeholder="Décrivez le contenu du cours..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[100px] mb-3"
                  rows={4}
                />

                <label className="text-sm font-medium text-gray-700 block mb-1.5">Devoir / Exercice (optionnel)</label>
                <textarea
                  value={formData.exercice}
                  onChange={(e) => setFormData(prev => ({ ...prev, exercice: e.target.value }))}
                  placeholder="Description du devoir ou des exercices..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[60px] mb-4"
                  rows={2}
                />

                <div className="flex flex-row gap-3">
                  <button
                    onClick={() => setModalVisible(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmitDeclaration}
                    className="flex-1 py-2.5 bg-schoolnet-primary hover:bg-schoolnet-primary/90 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de détail */}
      {detailModalVisible && selectedHistorique && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Détail du cours</h3>
                <button onClick={() => setDetailModalVisible(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Date et horaire</p>
                  <p className="text-sm text-gray-800">{formatDate(selectedHistorique.date)} • {selectedHistorique.horaireDebut} – {selectedHistorique.horaireFin}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Classe / Matière</p>
                  <p className="text-sm text-gray-800">{selectedHistorique.classe} • {selectedHistorique.matiere}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Durée réelle</p>
                  <p className="text-sm text-gray-800">{selectedHistorique.dureeReelle}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Contenu</p>
                  <p className="text-sm text-gray-800">{selectedHistorique.contenu}</p>
                </div>
                {selectedHistorique.exercice && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Devoir / Exercice</p>
                    <p className="text-sm text-gray-800">{selectedHistorique.exercice}</p>
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(selectedHistorique.statut)}`}>
                    {getStatutIcon(selectedHistorique.statut)}
                    {selectedHistorique.statut}
                  </span>
                </div>
                <button
                  onClick={() => setDetailModalVisible(false)}
                  className="w-full py-2.5 bg-schoolnet-primary hover:bg-schoolnet-primary/90 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de modification */}
      {editModalVisible && selectedHistorique && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="flex flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Modifier la déclaration</h3>
                <button onClick={() => setEditModalVisible(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">{formatDate(selectedHistorique.date)} • {selectedHistorique.classe} • {selectedHistorique.matiere}</p>
                </div>

                <label className="text-sm font-medium text-gray-700 block mb-1.5">Contenu du cours *</label>
                <textarea
                  value={editData.contenu}
                  onChange={(e) => setEditData(prev => ({ ...prev, contenu: e.target.value }))}
                  placeholder="Décrivez le contenu du cours..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[100px] mb-3"
                  rows={4}
                />

                <label className="text-sm font-medium text-gray-700 block mb-1.5">Devoir / Exercice (optionnel)</label>
                <textarea
                  value={editData.exercice}
                  onChange={(e) => setEditData(prev => ({ ...prev, exercice: e.target.value }))}
                  placeholder="Description du devoir ou des exercices..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-schoolnet-primary min-h-[60px] mb-4"
                  rows={2}
                />

                <div className="flex flex-row gap-3">
                  <button
                    onClick={() => setEditModalVisible(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateDeclaration}
                    className="flex-1 py-2.5 bg-schoolnet-primary hover:bg-schoolnet-primary/90 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
