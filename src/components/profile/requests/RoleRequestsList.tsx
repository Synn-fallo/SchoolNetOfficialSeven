import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase.web';
import { useAuth } from '@/contexts/AuthContext';
import RequestCard from './RequestCard';
import RequestDetailModal from './RequestDetailModal';

interface RoleRequest {
  id: string;
  role_souhaite: string;
  statut: 'en_attente' | 'valide' | 'rejete';
  message: string | null;
  justificatif_url: string | null;
  commentaire_admin: string | null;
  created_at: string;
  metadata: any;
}

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'chef_etablissement': return "Chef d'établissement";
    case 'autorite': return 'Autorité';
    case 'partenaire': return 'Partenaire';
    case 'eleve': return 'Élève';
    case 'parent': return 'Parent';
    case 'enseignant': return 'Enseignant';
    default: return role;
  }
};

export default function RoleRequestsList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('demandes_role')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching role requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) return;

    try {
      const { error } = await supabase
        .from('demandes_role')
        .update({ statut: 'annule' })
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      alert('❌ Impossible d\'annuler la demande');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-5">
        <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-slate-400">Aucune demande de rôle</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0 pb-2">
        {requests.map((item) => (
          <RequestCard
            key={item.id}
            id={item.id}
            title={getRoleLabel(item.role_souhaite)}
            status={item.statut}
            date={item.created_at}
            onPress={() => {
              setSelectedRequest(item);
              setModalVisible(true);
            }}
            onCancel={() => handleCancel(item.id)}
            showCancelButton={item.statut === 'en_attente'}
          />
        ))}
      </div>

      <RequestDetailModal
        visible={modalVisible}
        request={selectedRequest}
        type="role"
        onClose={() => {
          setModalVisible(false);
          setSelectedRequest(null);
        }}
        onRefresh={fetchRequests}
      />
    </>
  );
}
