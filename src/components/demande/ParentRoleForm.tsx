import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { ArrowLeft, Send, CheckCircle, FileText, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface FormData {
  educmaster: string;
  nomEnfant: string;
  prenomEnfant: string;
  dateNaissance: string;
  lieuNaissance: string;
  dernierEtablissement: string;
  lienParente: 'pere' | 'mere' | 'tuteur';
  justificatifUrl: string | null;
  justificatifName: string | null;
  declarationHonneur: boolean;
  acceptationCharte: boolean;
}

export default function ParentRoleForm() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [enfantTrouve, setEnfantTrouve] = useState<{ id: string; nom: string; prenom: string; etablissement: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    educmaster: '',
    nomEnfant: '',
    prenomEnfant: '',
    dateNaissance: '',
    lieuNaissance: '',
    dernierEtablissement: '',
    lienParente: 'pere',
    justificatifUrl: null,
    justificatifName: null,
    declarationHonneur: false,
    acceptationCharte: false,
  });

  const totalSteps = 3;
  const userName = profile?.prenom && profile?.nom 
    ? `${profile.prenom} ${profile.nom}` 
    : user?.email?.split('@')[0] || 'Parent';

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const rechercherEnfantParEducMaster = async () => {
    if (!formData.educmaster || formData.educmaster.length !== 13) {
      alert('❌ L\'EducMaster doit contenir 13 chiffres');
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('eleves')
        .select('id, nom, prenom, etablissement_id, etablissements(nom)')
        .eq('educmaster', formData.educmaster)
        .single();

      if (error || !data) {
        alert('❌ Aucun élève trouvé avec cet EducMaster. Vérifiez ou renseignez manuellement.');
        setEnfantTrouve(null);
      } else {
        setEnfantTrouve({
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
          etablissement: data.etablissements?.nom || 'Établissement inconnu',
        });
        updateField('nomEnfant', data.nom);
        updateField('prenomEnfant', data.prenom);
        alert('✅ Élève trouvé !');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      alert('❌ Impossible de rechercher l\'élève');
    } finally {
      setSearching(false);
    }
  };

  const handleUploadJustificatif = async () => {
    if (!user) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/justificatif_parent_${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            contentType: file.type,
          });
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
        
        updateField('justificatifUrl', urlData.publicUrl);
        updateField('justificatifName', file.name);
        alert('✅ Justificatif téléchargé');
      } catch (error) {
        console.error('Error uploading justificatif:', error);
        alert('❌ Impossible de télécharger le justificatif');
      }
    };
    input.click();
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        if (enfantTrouve) return true;
        return formData.nomEnfant.trim() && formData.prenomEnfant.trim() &&
               formData.dateNaissance.trim() && formData.lieuNaissance.trim() &&
               formData.dernierEtablissement.trim();
      case 2:
        return formData.lienParente !== null;
      case 3:
        return formData.declarationHonneur && formData.acceptationCharte;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(step + 1);
    } else {
      alert('❌ Veuillez remplir tous les champs obligatoires');
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!isStepValid()) {
      alert('❌ Veuillez accepter les conditions');
      return;
    }

    setLoading(true);
    try {
      // 1. Créer la demande de lien parent-élève
      const { error: demandeError } = await supabase
        .from('demandes_parent')
        .insert({
          parent_id: user?.id,
          enfant_id: enfantTrouve?.id || null,
          enfant_nom: formData.nomEnfant,
          enfant_prenom: formData.prenomEnfant,
          enfant_date_naissance: formData.dateNaissance,
          enfant_lieu_naissance: formData.lieuNaissance,
          enfant_dernier_etablissement: formData.dernierEtablissement,
          enfant_educmaster: formData.educmaster || null,
          lien_parente: formData.lienParente,
          justificatif_url: formData.justificatifUrl,
          statut: 'en_attente'
        });

      if (demandeError) throw demandeError;

      // 2. Ajouter le rôle parent à l'utilisateur
      await supabase.from('user_roles').insert({
        user_id: user?.id,
        role: 'parent',
        is_active: true,
        metadata: { source: 'formulaire_parent' }
      });

      // 3. Mettre à jour le profil
      await supabase.from('profiles').update({ active_role: 'parent' }).eq('id', user?.id);

      alert('✅ Votre demande de lien parent a été envoyée à l\'établissement. Vous serez notifié de sa validation.');
      navigate('/app');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('❌ Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center py-5 bg-white border-b border-slate-200">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            step >= s ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-200'
          }`}>
            <span className={`text-sm font-semibold ${step >= s ? 'text-white' : 'text-slate-500'}`}>{s}</span>
          </div>
          {s < 3 && (
            <div className={`w-10 h-0.5 mx-2 transition-colors ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">👶 Informations sur l'enfant</h3>
      <p className="text-sm text-slate-500 mb-6">Renseignez les informations de votre enfant pour créer le lien.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">EducMaster (13 chiffres, recommandé)</label>
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Ex: 2024123456789"
              maxLength={13}
              value={formData.educmaster}
              onChange={(e) => updateField('educmaster', e.target.value.replace(/\D/g, ''))}
            />
            <button
              onClick={rechercherEnfantParEducMaster}
              disabled={searching}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Rechercher</span>
                </>
              )}
            </button>
          </div>
          {enfantTrouve && (
            <div className="flex items-center gap-2 mt-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">Élève trouvé : {enfantTrouve.prenom} {enfantTrouve.nom}</span>
            </div>
          )}
        </div>

        {!enfantTrouve && (
          <>
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">ou saisie manuelle</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Nom de l'enfant *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={formData.nomEnfant}
                onChange={(e) => updateField('nomEnfant', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Prénom de l'enfant *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={formData.prenomEnfant}
                onChange={(e) => updateField('prenomEnfant', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Date de naissance *</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={formData.dateNaissance}
                onChange={(e) => updateField('dateNaissance', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Lieu de naissance *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={formData.lieuNaissance}
                onChange={(e) => updateField('lieuNaissance', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Dernier établissement fréquenté *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={formData.dernierEtablissement}
                onChange={(e) => updateField('dernierEtablissement', e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">🧾 Lien de parenté</h3>
      <p className="text-sm text-slate-500 mb-6">Précisez votre lien avec l'enfant et joignez un justificatif (recommandé).</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Lien de parenté *</label>
          <div className="flex gap-3">
            {['pere', 'mere', 'tuteur'].map((lien) => (
              <button
                key={lien}
                onClick={() => updateField('lienParente', lien as any)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  formData.lienParente === lien
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lien === 'pere' ? 'Père' : lien === 'mere' ? 'Mère' : 'Tuteur'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Justificatif (optionnel mais recommandé)</label>
          <button
            onClick={handleUploadJustificatif}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>{formData.justificatifName ? 'Modifier le justificatif' : 'Télécharger un justificatif'}</span>
          </button>
          {formData.justificatifName && (
            <div className="flex items-center gap-2 mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-slate-700">{formData.justificatifName}</span>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-1">Extrait d'acte de naissance, carnet de famille, jugement (PDF, image)</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">🧑‍⚖️ Engagement & certification</h3>

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          Je soussigné(e) <span className="font-bold text-blue-600">{userName}</span>, déclare sur l'honneur que les informations fournies sur mon enfant sont exactes et conformes à la réalité. Je m'engage à utiliser SchoolNet dans le respect de la vie privée de mon enfant et des règles de la plateforme.
        </p>
        <button
          onClick={() => updateField('declarationHonneur', !formData.declarationHonneur)}
          className="flex items-center gap-3 w-full text-left"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            formData.declarationHonneur ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
          }`}>
            {formData.declarationHonneur && <CheckCircle className="h-3.5 w-3.5 text-white" />}
          </div>
          <span className="text-sm text-slate-700">Je déclare sur l'honneur l'exactitude des informations fournies</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <h4 className="text-base font-semibold text-slate-800 mb-3">📜 Charte parent SchoolNet</h4>
        <div className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-line">
          En tant que parent sur SchoolNet, je m'engage à :
          
          • Respecter la vie privée de mon enfant et des autres élèves
          • Communiquer de manière bienveillante avec les enseignants
          • Utiliser les outils de contrôle parental de façon responsable
          • Signaler tout comportement inapproprié à l'équipe SchoolNet
        </div>
        <button
          onClick={() => updateField('acceptationCharte', !formData.acceptationCharte)}
          className="flex items-center gap-3 w-full text-left"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            formData.acceptationCharte ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
          }`}>
            {formData.acceptationCharte && <CheckCircle className="h-3.5 w-3.5 text-white" />}
          </div>
          <span className="text-sm text-slate-700">J'accepte la charte de bonne conduite SchoolNet</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center px-5 py-4 bg-white border-b border-slate-200">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">Demande de lien Parent</h2>
      </div>

      {renderStepIndicator()}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-5 py-4 bg-white border-t border-slate-200">
        {step > 1 && (
          <button
            onClick={handlePrevious}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>
        )}
        {step < totalSteps ? (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <span>Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Envoyer la demande</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
