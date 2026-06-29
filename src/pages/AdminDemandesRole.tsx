import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDemandes, DemandeRole } from '@/hooks/useAdminDemandes';
import DemandeList from '@/components/admin/DemandeList';
import DemandeDetailModal from '@/components/admin/DemandeDetailModal';

export default function AdminDemandesRole() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [selectedDemande, setSelectedDemande] = useState<DemandeRole | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    demandes,
    loading,
    error,
    isAdmin,
    statutFilter,
    setStatutFilter,
    roleFilter,
    setRoleFilter,
    fetchDemandes,
    validerDemande,
    rejeterDemande,
  } = useAdminDemandes();

  // Vérifier les droits admin
  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        <h2 className="text-xl font-bold text-red-600 mb-2">Accès non autorisé</h2>
        <p className="text-sm text-slate-500 text-center">Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    );
  }

  const handleDemandePress = (demande: DemandeRole) => {
    setSelectedDemande(demande);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDemande(null);
    fetchDemandes();
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Gestion des demandes</h2>
        <p className="text-sm text-slate-500">
          Demandes de rôles institutionnels (Chef d'établissement, Autorité, Partenaire)
        </p>
      </div>

      {/* Liste */}
      <DemandeList
        demandes={demandes}
        loading={loading}
        error={error}
        statutFilter={statutFilter}
        setStatutFilter={setStatutFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        onDemandePress={handleDemandePress}
        onRefresh={fetchDemandes}
      />

      {/* Modal de détail */}
      <DemandeDetailModal
        visible={modalVisible}
        demande={selectedDemande}
        onClose={handleCloseModal}
        onValidate={validerDemande}
        onReject={rejeterDemande}
      />
    </div>
  );
}
