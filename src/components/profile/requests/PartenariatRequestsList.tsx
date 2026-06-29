import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase.web';
import { useAuth } from '@/contexts/AuthContext';
import RequestCard from './RequestCard';
import RequestDetailModal from './RequestDetailModal';

interface PartenariatRequest {
  id: string;
  organisation_nom: string;
  type_partenaire: string;
  statut: 'en_attente' | 'valide' | 'rejete' | 'annule';
  proposition: string | null;
  notes_internes: string | null;
  created_at: string;
}

export default function PartenariatRequestsList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PartenariatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PartenariatRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('demandes_partenariat')
        .select('*')
        .eq('demandeur_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching partenariat requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande de partenariat ?')) return;

    try {
      const { error } = await supabase
        .from('demandes_partenariat')
        .update({ statut: 'annule' })
        .eq('id', requestId)
        .eq('demandeur_id', user?.id);

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
        <p className="text-sm text-slate-400">Aucune demande de partenariat</p>
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
            title={item.organisation_nom}
            subtitle={item.type_partenaire}
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
        type="partenariat"
        onClose={() => {
          setModalVisible(false);
          setSelectedRequest(null);
        }}
        onRefresh={fetchRequests}
      />
    </>
  );
}
