import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { ArrowLeft, Send, CheckCircle, FileText, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { generateUniqueIdentifiant } from '@/utils/identifiantUtils';

interface FormData {
  codeEtablissement: string;
  educmaster: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  parentNom: string;
  parentPrenom: string;
  parentEmail: string;
  parentTelephone: string;
  lienParente: 'pere' | 'mere' | 'tuteur';
  justificatifUrl: string | null;
  justificatifName: string | null;
  declarationHonneur: boolean;
  acceptationCharte: boolean;
}

export default function EleveRoleForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeValide, setCodeValide] = useState(false);
  const [educmasterValide, setEducmasterValide] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    codeEtablissement: '',
    educmaster: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    parentNom: '',
    parentPrenom: '',
    parentEmail: '',
    parentTelephone: '',
    lienParente: 'pere',
    justificatifUrl: null,
    justificatifName: null,
    declarationHonneur: false,
    acceptationCharte: false,
  });

  const totalSteps = 3;

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const verifierCodeEtablissement = async () => {
    if (!formData.codeEtablissement.trim()) {
      alert('❌ Veuillez saisir un code établissement');
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('id, etablissement_id, code, role')
        .eq('code', formData.codeEtablissement)
        .eq('role', 'eleve')
        .eq('is_active', true)
        .single();

      if (error || !data) {
        alert('❌ Ce code établissement n\'existe pas ou n\'est plus actif.');
        setCodeValide(false);
      } else {
        setCodeValide(true);
        alert('✅ Code établissement valide !');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('❌ Impossible de vérifier le code');
    } finally {
      setVerifying(false);
    }
  };

  const verifierEducmaster = async () => {
    if (!formData.educmaster || formData.educmaster.length !== 13) {
      alert('❌ L\'EducMaster doit contenir 13 chiffres');
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase
        .from('eleves')
        .select('id')
        .eq('educmaster', formData.educmaster)
        .maybeSingle();

      if (data) {
        alert('❌ Cet EducMaster est déjà associé à un compte élève.');
        setEducmasterValide(false);
      } else {
        setEducmasterValide(true);
        alert('✅ EducMaster valide !');
      }
    } catch (error) {
      console.error('Error verifying educmaster:', error);
      alert('❌ Impossible de vérifier l\'EducMaster');
    } finally {
      setVerifying(false);
    }
  };

  const handleUploadJustificatif = async () => {
    if (!user) return;
    
    // Simuler un upload de fichier
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/justificatif_eleve_${Date.now()}.${fileExt}`;
        
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
        return codeValide && educmasterValide && formData.nom.trim() && formData.prenom.trim() &&
               formData.dateNaissance.trim() && formData.lieuNaissance.trim();
      case 2:
        return formData.parentNom.trim() && formData.parentPrenom.trim() &&
               formData.parentEmail.trim() && formData.lienParente !== null;
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
      // Générer l'identifiant de connexion
      const { identifiant } = await generateUniqueIdentifiant(
        formData.nom,
        formData.educmaster,
        supabase
      );

      // 1. Créer le compte élève (en attente de validation)
      const { data: eleve, error: eleveError } = await supabase
        .from('eleves')
        .insert({
          educmaster: formData.educmaster,
          nom: formData.nom,
          prenom: formData.prenom,
          date_naissance: formData.dateNaissance,
          lieu_naissance: formData.lieuNaissance,
          identifiant_connexion: identifiant,
          statut: 'en_attente_validation'
        })
        .select()
        .single();

      if (eleveError) throw eleveError;

      // 2. Créer ou récupérer le compte parent
      let parentId = null;
      const { data: existingParent } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.parentEmail)
        .maybeSingle();

      if (existingParent) {
        parentId = existingParent.id;
      } else {
        const { data: newParent, error: parentError } = await supabase
          .from('profiles')
          .insert({
            email: formData.parentEmail,
            nom: formData.parentNom,
            prenom: formData.parentPrenom,
            telephone: formData.parentTelephone || null,
            active_role: 'parent'
          })
          .select()
          .single();
        
        if (parentError) throw parentError;
        parentId = newParent.id;
        
        // Ajouter le rôle parent
        await supabase.from('user_roles').insert({
          user_id: parentId,
          role: 'parent',
          is_active: true
        });
      }

      // 3. Créer le lien parent-élève
      await supabase.from('parent_eleve').insert({
        parent_id: parentId,
        eleve_id: eleve.id,
        lien_parente: formData.lienParente,
        justificatif_url: formData.justificatifUrl,
        statut: 'en_attente'
      });

      // 4. Créer la demande d'inscription (pour validation admin)
      await supabase.from('demandes_inscription').insert({
        eleve_id: eleve.id,
        educmaster: formData.educmaster,
        code_etablissement: formData.codeEtablissement,
        statut: 'en_attente'
      });

      alert(
        '✅ Votre demande d\'inscription a été envoyée à l\'établissement. Vous serez notifié de sa validation.'
      );
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
      <h3 className="text-xl font-bold text-slate-800 mb-2">👶 Identité de l'élève</h3>
      <p className="text-sm text-slate-500 mb-6">Renseignez le code établissement, l'EducMaster et l'identité de l'élève.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Code établissement *</label>
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Ex: SCH-2026-001"
              value={formData.codeEtablissement}
              onChange={(e) => updateField('codeEtablissement', e.target.value)}
            />
            <button
              onClick={verifierCodeEtablissement}
              disabled={verifying}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {verifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Vérifier</span>
                </>
              )}
            </button>
          </div>
          {codeValide && (
            <div className="flex items-center gap-2 mt-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">Code valide</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">EducMaster (13 chiffres) *</label>
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
              onClick={verifierEducmaster}
              disabled={verifying}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {verifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Vérifier</span>
                </>
              )}
            </button>
          </div>
          {educmasterValide && (
            <div className="flex items-center gap-2 mt-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">EducMaster valide</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Nom *</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={formData.nom}
            onChange={(e) => updateField('nom', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Prénom *</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={formData.prenom}
            onChange={(e) => updateField('prenom', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">👨‍👩‍👧 Lien avec les parents</h3>
      <p className="text-sm text-slate-500 mb-6">Renseignez les informations du parent ou tuteur légal.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Nom du parent *</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={formData.parentNom}
              onChange={(e) => updateField('parentNom', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Prénom du parent *</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={formData.parentPrenom}
              onChange={(e) => updateField('parentPrenom', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email du parent *</label>
          <input
            type="email"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={formData.parentEmail}
            onChange={(e) => updateField('parentEmail', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Téléphone du parent (optionnel)</label>
          <input
            type="tel"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={formData.parentTelephone}
            onChange={(e) => updateField('parentTelephone', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Lien de parenté *</label>
          <div className="flex gap-3">
            {['pere', 'mere', 'tuteur'].map((lien) => (
              <button
                key={lien}
                onClick={() => updateField('lienParente', lien)}
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
          <p className="text-xs text-slate-400 mt-1">Extrait d'acte de naissance, carnet de famille (PDF, image)</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">🧑‍⚖️ Engagement & certification</h3>

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          Je soussigné(e) parent/tuteur de l'élève, déclare sur l'honneur que les informations fournies sont exactes. Je m'engage à accompagner mon enfant dans l'utilisation responsable de SchoolNet.
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
        <h4 className="text-base font-semibold text-slate-800 mb-3">📜 Charte élève SchoolNet</h4>
        <div className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-line">
          En tant qu'élève sur SchoolNet, je m'engage à :
          
          • Utiliser la plateforme dans un cadre éducatif et respectueux
          • Respecter mes camarades et mes enseignants
          • Ne pas partager de contenus inappropriés
          • Signaler tout comportement suspect à mes parents ou à l'équipe SchoolNet
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
        <h2 className="text-lg font-semibold text-slate-800">Demande d'inscription Élève</h2>
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
