import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { ArrowLeft, Send, CheckCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface FormData {
  diplomes: string;
  specialites: string;
  etablissementFormation: string;
  anneeObtention: string;
  anneesExperience: string;
  dernierEtablissement: string;
  cyclesEnseignes: string[];
  matieresEnseignees: string[];
  cvUrl: string | null;
  cvName: string | null;
  declarationHonneur: boolean;
  acceptationCharte: boolean;
}

const CYCLES_OPTIONS = ['1er Cycle', '2nd Cycle'];
const MATIERES_OPTIONS = [
  'Mathématiques', 'Français', 'Anglais', 'Physique', 'Chimie',
  'SVT', 'Histoire-Géographie', 'Philosophie', 'Génie Mécanique',
  'Génie Civil', 'Dessin Technique', 'Électronique', 'Informatique'
];

export default function EnseignantRoleForm() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    diplomes: '',
    specialites: '',
    etablissementFormation: '',
    anneeObtention: '',
    anneesExperience: '',
    dernierEtablissement: '',
    cyclesEnseignes: [],
    matieresEnseignees: [],
    cvUrl: null,
    cvName: null,
    declarationHonneur: false,
    acceptationCharte: false,
  });

  const totalSteps = 4;
  const userName = profile?.prenom && profile?.nom 
    ? `${profile.prenom} ${profile.nom}` 
    : user?.email?.split('@')[0] || 'Utilisateur';

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCycle = (cycle: string) => {
    const current = formData.cyclesEnseignes;
    if (current.includes(cycle)) {
      updateField('cyclesEnseignes', current.filter(c => c !== cycle));
    } else {
      updateField('cyclesEnseignes', [...current, cycle]);
    }
  };

  const toggleMatiere = (matiere: string) => {
    const current = formData.matieresEnseignees;
    if (current.includes(matiere)) {
      updateField('matieresEnseignees', current.filter(m => m !== matiere));
    } else {
      updateField('matieresEnseignees', [...current, matiere]);
    }
  };

  const handleUploadCV = async () => {
    if (!user) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/cv_${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            contentType: file.type,
          });
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
        
        updateField('cvUrl', urlData.publicUrl);
        updateField('cvName', file.name);
        alert('✅ CV téléchargé avec succès');
      } catch (error) {
        console.error('Error uploading CV:', error);
        alert('❌ Impossible de télécharger le CV');
      }
    };
    input.click();
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.diplomes.trim() && formData.specialites.trim() && 
               formData.etablissementFormation.trim() && formData.anneeObtention.trim();
      case 2:
        return formData.anneesExperience.trim() && formData.cyclesEnseignes.length > 0;
      case 3:
        return true; // CV optionnel
      case 4:
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
      const requestData = {
        user_id: user?.id,
        role_souhaite: 'enseignant',
        statut: 'valide',
        metadata: {
          diplomes: formData.diplomes,
          specialites: formData.specialites,
          etablissementFormation: formData.etablissementFormation,
          anneeObtention: formData.anneeObtention,
          anneesExperience: formData.anneesExperience,
          dernierEtablissement: formData.dernierEtablissement,
          cyclesEnseignes: formData.cyclesEnseignes,
          matieresEnseignees: formData.matieresEnseignees,
          cv_url: formData.cvUrl,
          cv_name: formData.cvName,
          declaration_honneur: true,
          charte_acceptee: true
        }
      };

      const { error } = await supabase.from('demandes_role').insert(requestData);
      if (error) throw error;

      await supabase.from('user_roles').insert({
        user_id: user?.id,
        role: 'enseignant',
        is_active: true,
        metadata: { source: 'formulaire_enseignant' }
      });

      await supabase.from('profiles').update({ active_role: 'enseignant' }).eq('id', user?.id);

      alert('✅ Votre compte enseignant a été activé. Vous allez être redirigé vers votre tableau de bord.');
      navigate('/app/enseignant');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('❌ Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center py-5 bg-white border-b border-slate-200">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            step >= s ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-200'
          }`}>
            <span className={`text-sm font-semibold ${step >= s ? 'text-white' : 'text-slate-500'}`}>{s}</span>
          </div>
          {s < 4 && (
            <div className={`w-10 h-0.5 mx-2 transition-colors ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">🎓 Diplômes et formations</h3>
      <p className="text-sm text-slate-500 mb-6">Renseignez votre plus haut diplôme et vos spécialités.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Diplômes obtenus *</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Ex: Master en Mathématiques, CAPET, Licence..."
            value={formData.diplomes}
            onChange={(e) => updateField('diplomes', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Spécialités *</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Ex: Mathématiques, Génie Mécanique, Anglais..."
            value={formData.specialites}
            onChange={(e) => updateField('specialites', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Établissement de formation (diplôme le plus élevé) *</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Ex: Université d'Abomey-Calavi, ENS..."
            value={formData.etablissementFormation}
            onChange={(e) => updateField('etablissementFormation', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Année d'obtention *</label>
          <input
            type="number"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Ex: 2020"
            value={formData.anneeObtention}
            onChange={(e) => updateField('anneeObtention', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">👨‍🏫 Expérience professionnelle</h3>
      <p className="text-sm text-slate-500 mb-6">Votre parcours professionnel dans l'enseignement.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Années d'expérience dans l'enseignement *</label>
          <input
            type="number"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Ex: 5"
            value={formData.anneesExperience}
            onChange={(e) => updateField('anneesExperience', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Dernier établissement d'exercice (optionnel)</label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Ex: Lycée Technique de Kpondéhou"
            value={formData.dernierEtablissement}
            onChange={(e) => updateField('dernierEtablissement', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Cycles actuellement enseignés *</label>
          <div className="flex gap-3">
            {CYCLES_OPTIONS.map((cycle) => (
              <button
                key={cycle}
                onClick={() => toggleCycle(cycle)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.cyclesEnseignes.includes(cycle)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Matières enseignées (optionnel)</label>
          <div className="flex flex-wrap gap-2">
            {MATIERES_OPTIONS.map((matiere) => (
              <button
                key={matiere}
                onClick={() => toggleMatiere(matiere)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  formData.matieresEnseignees.includes(matiere)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {matiere}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ces informations seront visibles par les établissements et les parents pour d'éventuelles opportunités.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">📎 Documents justificatifs</h3>
      <p className="text-sm text-slate-500 mb-6">Un CV permet de valoriser votre profil auprès des établissements et des parents.</p>

      <button
        onClick={handleUploadCV}
        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
      >
        <FileText className="h-4 w-4" />
        <span>{formData.cvName ? 'Modifier le CV' : 'Télécharger votre CV (optionnel)'}</span>
      </button>

      {formData.cvName && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="h-4 w-4 text-emerald-600" />
          <span className="text-sm text-slate-700">{formData.cvName}</span>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2">Formats acceptés : PDF, image, DOC. Un CV bien renseigné augmente vos chances d'être contacté.</p>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">🧑‍⚖️ Engagement & certification</h3>
      
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          Je soussigné(e) <span className="font-bold text-blue-600">{userName}</span>, déclare sur l'honneur que l'ensemble des informations fournies dans ce formulaire est exact et conforme à la réalité. Je m'engage à respecter les valeurs éducatives portées par SchoolNet, à faire preuve de bienveillance envers les élèves, et à ne pas utiliser la plateforme à des fins contraires à l'éthique ou à la loi.
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
        <h4 className="text-base font-semibold text-slate-800 mb-3">📜 Charte de bonne conduite SchoolNet</h4>
        <div className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-line">
          En tant qu'enseignant sur SchoolNet, je m'engage à :
          
          • Respecter la confidentialité des données des élèves et des parents
          • Maintenir une communication professionnelle et bienveillante
          • Ne pas partager de contenus inappropriés ou illicites
          • Signaler tout comportement suspect ou abusif à l'équipe SchoolNet
          • Contribuer à un environnement éducatif sain et respectueux
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
        <h2 className="text-lg font-semibold text-slate-800">Demande de rôle Enseignant</h2>
      </div>

      {renderStepIndicator()}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
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
