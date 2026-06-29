import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase.web';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Search, Edit2, Trash2, Check, X, User, Shield, Mail, Phone, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface Utilisateur {
  id: string;
  email?: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role: string;
  all_roles?: string[];
  etablissement_id?: string;
  etablissement_nom?: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUtilisateurs() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);
  const [newRole, setNewRole] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (isAdmin) {
      loadUtilisateurs();
    }
  }, [isAdmin]);

  const loadUtilisateurs = async () => {
    setLoading(true);
    try {
      // 1. Récupérer tous les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nom, prenom, telephone, is_active, created_at');

      if (profilesError) throw profilesError;

      // 2. Récupérer tous les rôles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, etablissement_id');

      if (rolesError) throw rolesError;

      // 3. Récupérer les établissements
      const { data: etablissements, error: etabError } = await supabase
        .from('etablissements')
        .select('id, nom');

      if (etabError) throw etabError;

      const etablissementsMap = new Map();
      etablissements?.forEach(e => etablissementsMap.set(e.id, e.nom));

      // 4. Grouper les rôles par utilisateur
      const rolesByUser = new Map<string, { roles: string[]; etablissement_id?: string }>();
      for (const role of (userRoles || [])) {
        if (!rolesByUser.has(role.user_id)) {
          rolesByUser.set(role.user_id, { roles: [], etablissement_id: role.etablissement_id });
        }
        rolesByUser.get(role.user_id)!.roles.push(role.role);
      }

      // 5. Construire la liste des utilisateurs (un par profil)
      const utilisateursList = (profiles || []).map(profile => {
        const userRolesData = rolesByUser.get(profile.id);
        const userRolesList = userRolesData?.roles || ['visiteur'];
        
        // Prendre le rôle principal (ordre de priorité)
        const mainRole = userRolesList.includes('admin') ? 'admin'
          : userRolesList.includes('chef_etablissement') ? 'chef_etablissement'
          : userRolesList.includes('enseignant') ? 'enseignant'
          : userRolesList.includes('eleve') ? 'eleve'
          : userRolesList.includes('parent') ? 'parent'
          : 'visiteur';

        return {
          id: profile.id,
          nom: profile.nom || '',
          prenom: profile.prenom || '',
          telephone: profile.telephone,
          is_active: profile.is_active,
          created_at: profile.created_at,
          role: mainRole,
          all_roles: userRolesList,
          etablissement_id: userRolesData?.etablissement_id,
          etablissement_nom: userRolesData?.etablissement_id ? etablissementsMap.get(userRolesData.etablissement_id) : undefined,
        };
      });

      // Trier par date de création (plus récent en premier)
      utilisateursList.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setUtilisateurs(utilisateursList);
    } catch (error) {
      console.error('Error loading utilisateurs:', error);
      alert('❌ Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedUser.id,
          role: newRole,
          etablissement_id: selectedUser.etablissement_id || null,
          is_active: true,
        });

      if (error) throw error;

      alert(`✅ Rôle modifié pour ${selectedUser.prenom} ${selectedUser.nom}`);
      setModalVisible(false);
      setSelectedUser(null);
      setNewRole('');
      loadUtilisateurs();
    } catch (error) {
      console.error('Error changing role:', error);
      alert('❌ Impossible de modifier le rôle');
    }
  };

  const handleToggleActive = async (user: Utilisateur) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;

      alert(`✅ Compte ${user.is_active ? 'désactivé' : 'activé'} avec succès`);
      loadUtilisateurs();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('❌ Impossible de modifier le statut');
    }
  };

  const toggleExpandUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      chef_etablissement: "Chef d'établissement",
      enseignant: 'Enseignant',
      eleve: 'Élève',
      parent: 'Parent',
      visiteur: 'Visiteur',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: '#8B5CF6',
      chef_etablissement: '#3B82F6',
      enseignant: '#10B981',
      eleve: '#F59E0B',
      parent: '#EC4899',
      visiteur: '#6B7280',
    };
    return colors[role] || '#6B7280';
  };

  const filteredUtilisateurs = utilisateurs.filter(
    (u) =>
      u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistiques des rôles
  const stats = {
    total: utilisateurs.length,
    admins: utilisateurs.filter(u => u.role === 'admin').length,
    chefs: utilisateurs.filter(u => u.role === 'chef_etablissement').length,
    enseignants: utilisateurs.filter(u => u.role === 'enseignant').length,
    eleves: utilisateurs.filter(u => u.role === 'eleve').length,
    parents: utilisateurs.filter(u => u.role === 'parent').length,
    visiteurs: utilisateurs.filter(u => u.role === 'visiteur').length,
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        <h2 className="text-xl font-bold text-red-600 mb-2">Accès non autorisé</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">👥 Utilisateurs</h2>
        <p className="text-sm text-slate-500">{stats.total} utilisateur(s) au total</p>
      </div>

      {/* Statistiques */}
      <div className="flex gap-4 px-4 py-3 bg-white border-b border-slate-200 overflow-x-auto">
        <div className="text-center flex-shrink-0">
          <Users className="h-5 w-5 text-slate-400 mx-auto" />
          <p className="text-lg font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="text-center flex-shrink-0">
          <Shield className="h-5 w-5 text-purple-500 mx-auto" />
          <p className="text-lg font-bold text-purple-600">{stats.admins}</p>
          <p className="text-xs text-slate-400">Admins</p>
        </div>
        <div className="text-center flex-shrink-0">
          <Shield className="h-5 w-5 text-blue-500 mx-auto" />
          <p className="text-lg font-bold text-blue-600">{stats.chefs}</p>
          <p className="text-xs text-slate-400">Chefs</p>
        </div>
        <div className="text-center flex-shrink-0">
          <User className="h-5 w-5 text-emerald-500 mx-auto" />
          <p className="text-lg font-bold text-emerald-600">{stats.enseignants}</p>
          <p className="text-xs text-slate-400">Enseignants</p>
        </div>
        <div className="text-center flex-shrink-0">
          <User className="h-5 w-5 text-amber-500 mx-auto" />
          <p className="text-lg font-bold text-amber-600">{stats.eleves}</p>
          <p className="text-xs text-slate-400">Élèves</p>
        </div>
        <div className="text-center flex-shrink-0">
          <User className="h-5 w-5 text-pink-500 mx-auto" />
          <p className="text-lg font-bold text-pink-600">{stats.parents}</p>
          <p className="text-xs text-slate-400">Parents</p>
        </div>
        <div className="text-center flex-shrink-0">
          <User className="h-5 w-5 text-slate-400 mx-auto" />
          <p className="text-lg font-bold text-slate-600">{stats.visiteurs}</p>
          <p className="text-xs text-slate-400">Visiteurs</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="flex items-center gap-2 bg-white mx-4 my-4 px-3 py-2 rounded-xl border border-slate-200">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
          placeholder="Rechercher un utilisateur (nom, prénom)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Liste des utilisateurs */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Chargement...</span>
        </div>
      ) : filteredUtilisateurs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-400">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {filteredUtilisateurs.map((utilisateur) => {
            const isExpanded = expandedUsers.has(utilisateur.id);
            const hasMultipleRoles = utilisateur.all_roles && utilisateur.all_roles.length > 1;
            const roleColor = getRoleColor(utilisateur.role);
            
            return (
              <Card key={utilisateur.id} className="p-4">
                <button
                  onClick={() => toggleExpandUser(utilisateur.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: roleColor }}
                    >
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{utilisateur.prenom} {utilisateur.nom}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: roleColor + '20', color: roleColor }}
                        >
                          {getRoleLabel(utilisateur.role)}
                        </span>
                        {hasMultipleRoles && (
                          <span className="text-xs text-amber-500 italic">
                            +{utilisateur.all_roles!.length - 1} autre(s) rôle(s)
                          </span>
                        )}
                        {utilisateur.telephone && (
                          <span className="text-xs text-slate-400">{utilisateur.telephone}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">ID: {utilisateur.id.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(utilisateur);
                          setNewRole(utilisateur.role);
                          setModalVisible(true);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Modifier le rôle"
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(utilisateur);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label={utilisateur.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {utilisateur.is_active ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-emerald-500" />
                        )}
                      </button>
                      {hasMultipleRoles && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandUser(utilisateur.id);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </button>

                {/* Section déroulante pour les rôles multiples */}
                {isExpanded && hasMultipleRoles && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Tous les rôles :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {utilisateur.all_roles!.map((role, idx) => {
                        const color = getRoleColor(role);
                        return (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: color + '20', color: color }}
                          >
                            {getRoleLabel(role)}
                          </span>
                        );
                      })}
                    </div>
                    {utilisateur.etablissement_nom && (
                      <p className="text-xs text-slate-500 mt-1.5">Établissement: {utilisateur.etablissement_nom}</p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal changement de rôle */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h4 className="text-lg font-semibold text-slate-800 text-center mb-1">Modifier le rôle</h4>
            <p className="text-sm text-slate-500 text-center mb-4">
              {selectedUser?.prenom} {selectedUser?.nom}
            </p>
            <div className="space-y-2 mb-5">
              {['admin', 'chef_etablissement', 'enseignant', 'eleve', 'parent', 'visiteur'].map((role) => {
                const color = getRoleColor(role);
                return (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border transition-colors ${
                      newRole === role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className={`text-sm ${newRole === role ? 'text-blue-600 font-medium' : 'text-slate-700'}`}>
                        {getRoleLabel(role)}
                      </span>
                    </div>
                    {newRole === role && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalVisible(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleRoleChange}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
