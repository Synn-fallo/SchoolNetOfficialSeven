import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase.web';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChevronDown, CheckCircle, XCircle, Globe } from 'lucide-react';

export type RequestType = 'etablissement' | 'partenariat';

interface RequestFormProps {
  type: RequestType;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isSubmitting?: boolean;
  currentUserId?: string;
  currentRequestId?: string;
}

const TYPE_ETABLISSEMENT_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Privé', value: 'prive' },
  { label: 'Mixte', value: 'mixte' },
];

const PLAN_ABONNEMENT_OPTIONS = [
  { label: 'Gratuit', value: 'gratuit' },
  { label: 'Basique', value: 'basique' },
  { label: 'Premium', value: 'premium' },
  { label: 'Entreprise', value: 'entreprise' },
];

const TYPE_PARTENAIRE_OPTIONS = [
  { label: 'ONG', value: 'ong' },
  { label: 'Opérateur télécom', value: 'operateur_telecom' },
  { label: 'Éditeur', value: 'editeur' },
  { label: 'Sponsor', value: 'sponsor' },
  { label: 'Autre', value: 'autre' },
];

const TYPE_COLLABORATION_OPTIONS = [
  { label: 'Sponsoring', value: 'sponsoring' },
  { label: 'Contenu', value: 'contenu' },
  { label: 'Technique', value: 'technique' },
  { label: 'Formation', value: 'formation' },
  { label: 'Autre', value: 'autre' },
];

const MODE_VERIFICATION_OPTIONS = [
  { label: "Numéro d'agrément officiel", value: 'auto' },
  { label: 'Upload du cachet humide + signature', value: 'manuel_cachet' },
  { label: 'Lien vers site/Facebook officiel', value: 'manuel_site' },
];

const STORAGE_KEY = 'schoolnet_draft_etablissement';

function CustomPicker({ label, value, options, onSelect, error, disabled = false }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options.find((opt: any) => opt.value === value)?.label || 'Sélectionner';

  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-slate-700 block mb-1.5">{label} *</label>
      <button
        onClick={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        className={`w-full flex justify-between items-center px-4 py-3 bg-white rounded-xl border text-sm transition-all ${
          error ? 'border-red-500' : 'border-slate-200'
        } ${disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'hover:border-slate-300 cursor-pointer'}`}
      >
        <span className={!value ? 'text-slate-400' : 'text-slate-800'}>{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {modalVisible && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl shadow-2xl p-5 max-h-[80%] overflow-y-auto">
            <h4 className="text-lg font-semibold text-slate-800 text-center mb-4">{label}</h4>
            {options.map((opt: any) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value);
                  setModalVisible(false);
                }}
                className="w-full flex justify-between items-center py-3.5 border-b border-slate-50 last:border-0 text-left"
              >
                <span className="text-sm text-slate-700">{opt.label}</span>
                {value === opt.value && <CheckCircle className="h-4 w-4 text-blue-600" />}
              </button>
            ))}
            <button
              onClick={() => setModalVisible(false)}
              className="w-full mt-4 py-3 text-center text-sm font-medium text-slate-500 border-t border-slate-100"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ValidatedInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  validationType,
  onValidationChange,
  required = true,
  currentUserId,
  currentRequestId,
  multiline = false,
  numberOfLines = 1,
}: any) {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const validateEmail = async (email: string): Promise<{ valid: boolean; error: string | null }> => {
    if (!email && !required) return { valid: true, error: null };
    if (!email && required) return { valid: false, error: 'Email requis' };

    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: "Format d'email invalide" };
    }

    try {
      const { data: existingEtab } = await supabase
        .from('etablissements')
        .select('id')
        .eq('email', email)
        .eq('statut', 'ACTIF')
        .maybeSingle();

      if (existingEtab) {
        return { valid: false, error: 'Cet email est déjà utilisé par un établissement actif' };
      }

      let query = supabase
        .from('demandes_etablissement')
        .select('id, demandeur_id')
        .eq('email_contact', email)
        .in('statut', ['en_attente', 'en_cours']);

      if (currentRequestId) {
        query = query.neq('id', currentRequestId);
      }

      const { data: pendingRequests } = await query;

      if (pendingRequests && pendingRequests.length > 0) {
        return { valid: false, error: 'Cet email est déjà utilisé dans une demande en attente' };
      }

      return { valid: true, error: null };
    } catch {
      return { valid: true, error: null };
    }
  };

  const validateUrl = (url: string): { valid: boolean; error: string | null } => {
    if (!url && !required) return { valid: true, error: null };
    if (!url && required) return { valid: false, error: 'Ce champ est requis' };

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { valid: false, error: `Format URL - suggestion: https://${url}` };
    }

    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(url)) {
      return { valid: false, error: 'Format URL invalide (ex: https://www.exemple.com)' };
    }

    return { valid: true, error: null };
  };

  useEffect(() => {
    const validate = async () => {
      setValidating(true);
      let result: { valid: boolean; error: string | null } = { valid: false, error: null };

      if (validationType === 'email') {
        result = await validateEmail(value);
      } else if (validationType === 'url') {
        result = validateUrl(value);
      } else {
        const valid = required ? !!value : true;
        result = { valid, error: !value && required ? 'Ce champ est requis' : null };
      }

      setIsValid(result.valid);
      setError(result.error);
      setValidating(false);
      if (onValidationChange) onValidationChange(result.valid);
    };

    const timer = setTimeout(validate, 500);
    return () => clearTimeout(timer);
  }, [value, validationType, required, currentUserId, currentRequestId]);

  const showValidIcon = isValid && value && !error;
  const showErrorIcon = !isValid && error && value;

  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-slate-700 block mb-1.5">
        {label} {required ? '*' : '(optionnel)'}
      </label>
      <div className={`flex items-center border rounded-xl bg-white transition-all ${
        error ? 'border-red-500' : showValidIcon ? 'border-emerald-500' : 'border-slate-200'
      }`}>
        {validationType === 'url' && <Globe className="h-4 w-4 text-slate-400 ml-3" />}
        {multiline ? (
          <textarea
            className={`flex-1 px-4 py-3 text-sm text-slate-800 bg-transparent outline-none resize-none min-h-[80px] ${
              validationType === 'url' ? 'ml-1' : ''
            }`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
          />
        ) : (
          <input
            type={keyboardType === 'email' ? 'email' : keyboardType === 'phone-pad' ? 'tel' : keyboardType === 'numeric' ? 'number' : 'text'}
            className={`flex-1 px-4 py-3 text-sm text-slate-800 bg-transparent outline-none ${
              validationType === 'url' ? 'ml-1' : ''
            }`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
          />
        )}
        {validating && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />}
        {!validating && showValidIcon && <CheckCircle className="h-4 w-4 text-emerald-500 mr-3" />}
        {!validating && showErrorIcon && <XCircle className="h-4 w-4 text-red-500 mr-3" />}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function RequestForm({ type, onSubmit, initialData, isSubmitting = false, currentUserId, currentRequestId }: RequestFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    nom_etablissement: '',
    type_etablissement: 'prive',
    adresse: '',
    ville: '',
    telephone: '',
    email_contact: '',
    site_web: '',
    plan_souhaite: 'basique',
    message_demandeur: '',
    mode_verification: 'auto',
    numero_agrement: '',
    justificatif_url: '',
    region_id: '',
    departement_id: '',
    type_partenaire: 'autre',
    organisation_nom: '',
    organisation_site: '',
    organisation_siege: '',
    contact_nom: '',
    contact_email: '',
    contact_telephone: '',
    type_collaboration: 'autre',
    proposition: '',
    montant_propose: '',
  });

  const [fieldValidity, setFieldValidity] = useState({ email_contact: false, site_web: true });

  const isEtablissement = type === 'etablissement';
  const totalSteps = isEtablissement ? 4 : 2;

  // Sauvegarde du brouillon
  useEffect(() => {
    if (isEtablissement && Object.values(formData).some((v) => v)) {
      const timer = setTimeout(() => {
        try {
          const draft = { data: formData, step, savedAt: new Date().toISOString() };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, step, isEtablissement]);

  // Restauration du brouillon
  useEffect(() => {
    if (isEtablissement && !initialData) {
      try {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          const savedDate = new Date(draft.savedAt);
          const now = new Date();
          const hoursSinceSave = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);

          if (hoursSinceSave < 24) {
            if (confirm('Vous avez un brouillon non finalisé. Souhaitez-vous le restaurer ?')) {
              setFormData(draft.data);
              setStep(draft.step);
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [isEtablissement, initialData]);

  const updateField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (field === 'email_contact') {
      setFieldValidity((prev) => ({ ...prev, email_contact: false }));
    }
  };

  const handleValidationChange = (field: string, isValid: boolean) => {
    setFieldValidity((prev) => ({ ...prev, [field]: isValid }));
  };

  const isStepValid = () => {
    if (isEtablissement) {
      if (step === 1) {
        const requiredFields = ['nom_etablissement', 'adresse', 'ville', 'telephone', 'email_contact', 'region_id', 'departement_id'];
        const allRequiredFilled = requiredFields.every((field) => formData[field as keyof typeof formData]);
        return allRequiredFilled && fieldValidity.email_contact;
      }
      if (step === 2) {
        if (formData.mode_verification === 'auto') return !!formData.numero_agrement;
        if (formData.mode_verification === 'manuel_cachet') return !!formData.justificatif_url;
        if (formData.mode_verification === 'manuel_site') return !!formData.site_web;
        return false;
      }
      if (step === 4) return !!formData.plan_souhaite;
    } else {
      if (step === 1) {
        const requiredFields = ['organisation_nom', 'contact_nom', 'contact_email', 'contact_telephone'];
        return requiredFields.every((field) => formData[field as keyof typeof formData]);
      }
      if (step === 2) return !!formData.proposition;
    }
    return true;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      alert('❌ Veuillez remplir tous les champs obligatoires correctement');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!isStepValid()) {
      alert('❌ Veuillez remplir tous les champs obligatoires correctement');
      return;
    }
    try {
      await onSubmit(formData);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      alert('❌ ' + (err instanceof Error ? err.message : 'Erreur lors de la soumission'));
    }
  };

  const renderStep1 = () => {
    if (isEtablissement) {
      return (
        <>
          <ValidatedInput
            label="Nom de l'établissement"
            value={formData.nom_etablissement}
            onChangeText={(v: string) => updateField('nom_etablissement', v)}
            placeholder="Ex: Lycée Moderne de Cotonou"
            required
          />
          <CustomPicker
            label="Type d'établissement"
            value={formData.type_etablissement}
            options={TYPE_ETABLISSEMENT_OPTIONS}
            onSelect={(v: string) => updateField('type_etablissement', v)}
          />

          <CustomPicker
            label="Région"
            value={formData.region_id}
            options={[]}
            onSelect={(v: string) => {
              updateField('region_id', v);
              updateField('departement_id', '');
            }}
            error={!formData.region_id ? 'La région est obligatoire' : undefined}
          />

          <CustomPicker
            label="Département"
            value={formData.departement_id}
            options={[]}
            onSelect={(v: string) => updateField('departement_id', v)}
            disabled={!formData.region_id}
            error={!formData.departement_id && formData.region_id ? 'Le département est obligatoire' : undefined}
          />

          <ValidatedInput
            label="Ville"
            value={formData.ville}
            onChangeText={(v: string) => updateField('ville', v)}
            placeholder="Cotonou"
            required
          />
          <ValidatedInput
            label="Adresse"
            value={formData.adresse}
            onChangeText={(v: string) => updateField('adresse', v)}
            placeholder="Adresse complète"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <ValidatedInput
              label="Téléphone"
              value={formData.telephone}
              onChangeText={(v: string) => updateField('telephone', v)}
              placeholder="+229 99 00 00 00"
              keyboardType="phone-pad"
              required
            />
            <ValidatedInput
              label="Email"
              value={formData.email_contact}
              onChangeText={(v: string) => updateField('email_contact', v)}
              placeholder="contact@ecole.com"
              keyboardType="email"
              validationType="email"
              onValidationChange={(isValid: boolean) => handleValidationChange('email_contact', isValid)}
              required
              currentUserId={currentUserId}
              currentRequestId={currentRequestId}
            />
          </div>
          <ValidatedInput
            label="Site web (optionnel)"
            value={formData.site_web}
            onChangeText={(v: string) => updateField('site_web', v)}
            placeholder="https://www.ecole.com"
            keyboardType="url"
            validationType="url"
            onValidationChange={(isValid: boolean) => handleValidationChange('site_web', isValid)}
            required={false}
          />
        </>
      );
    } else {
      return (
        <>
          <CustomPicker
            label="Type de partenaire"
            value={formData.type_partenaire}
            options={TYPE_PARTENAIRE_OPTIONS}
            onSelect={(v: string) => updateField('type_partenaire', v)}
          />
          <ValidatedInput
            label="Nom de l'organisation"
            value={formData.organisation_nom}
            onChangeText={(v: string) => updateField('organisation_nom', v)}
            placeholder="Nom complet"
            required
          />
          <ValidatedInput
            label="Site web"
            value={formData.organisation_site}
            onChangeText={(v: string) => updateField('organisation_site', v)}
            placeholder="https://www.organisation.com"
            keyboardType="url"
            validationType="url"
            required={false}
          />
          <ValidatedInput
            label="Siège social"
            value={formData.organisation_siege}
            onChangeText={(v: string) => updateField('organisation_siege', v)}
            placeholder="Cotonou, Bénin"
            required={false}
          />
          <ValidatedInput
            label="Nom du contact"
            value={formData.contact_nom}
            onChangeText={(v: string) => updateField('contact_nom', v)}
            placeholder="Prénom et nom"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <ValidatedInput
              label="Email contact"
              value={formData.contact_email}
              onChangeText={(v: string) => updateField('contact_email', v)}
              placeholder="contact@organisation.com"
              keyboardType="email"
              validationType="email"
              required
              currentUserId={currentUserId}
              currentRequestId={currentRequestId}
            />
            <ValidatedInput
              label="Téléphone"
              value={formData.contact_telephone}
              onChangeText={(v: string) => updateField('contact_telephone', v)}
              placeholder="+229 99 00 00 00"
              keyboardType="phone-pad"
              required
            />
          </div>
          <CustomPicker
            label="Type de collaboration"
            value={formData.type_collaboration}
            options={TYPE_COLLABORATION_OPTIONS}
            onSelect={(v: string) => updateField('type_collaboration', v)}
          />
        </>
      );
    }
  };

  const renderStep2 = () => {
    if (isEtablissement) {
      return (
        <>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Vérification d'identité</h4>
          <p className="text-sm text-slate-500 mb-4">Choisissez un mode de vérification pour établir votre légitimité.</p>
          <CustomPicker
            label="Mode de vérification"
            value={formData.mode_verification}
            options={MODE_VERIFICATION_OPTIONS}
            onSelect={(v: string) => updateField('mode_verification', v)}
          />
          {formData.mode_verification === 'auto' && (
            <ValidatedInput
              label="Numéro d'agrément officiel"
              value={formData.numero_agrement}
              onChangeText={(v: string) => updateField('numero_agrement', v)}
              placeholder="Ex: 2024-0012/AGRE"
              required
            />
          )}
          {formData.mode_verification === 'manuel_cachet' && (
            <div>
              <ValidatedInput
                label="URL du justificatif (cachet + signature)"
                value={formData.justificatif_url}
                onChangeText={(v: string) => updateField('justificatif_url', v)}
                placeholder="https://... (image du document scanné)"
                keyboardType="url"
                validationType="url"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Uploader le cachet humide + signature scanné. Validation manuelle sous 48h.</p>
            </div>
          )}
          {formData.mode_verification === 'manuel_site' && (
            <div>
              <ValidatedInput
                label="Site web ou page Facebook officielle"
                value={formData.site_web}
                onChangeText={(v: string) => updateField('site_web', v)}
                placeholder="https://www.ecole.com"
                keyboardType="url"
                validationType="url"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Lien vers un site officiel existant. Validation manuelle sous 48h.</p>
            </div>
          )}
        </>
      );
    } else {
      return (
        <>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Proposition de partenariat</h4>
          <p className="text-sm text-slate-500 mb-4">Décrivez votre proposition.</p>
          <ValidatedInput
            label="Proposition"
            value={formData.proposition}
            onChangeText={(v: string) => updateField('proposition', v)}
            placeholder="Décrivez votre proposition de partenariat"
            multiline
            numberOfLines={5}
            required
          />
          <ValidatedInput
            label="Montant proposé (optionnel)"
            value={formData.montant_propose}
            onChangeText={(v: string) => updateField('montant_propose', v)}
            placeholder="En FCFA"
            keyboardType="numeric"
            required={false}
          />
        </>
      );
    }
  };

  const renderStep3 = () => {
    if (isEtablissement) {
      return (
        <>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Message (optionnel)</h4>
          <p className="text-sm text-slate-500 mb-4">Vous pouvez ajouter un message pour accompagner votre demande.</p>
          <Input
            label="Votre message"
            placeholder="Informations complémentaires..."
            value={formData.message_demandeur}
            onChange={(e) => updateField('message_demandeur', e.target.value)}
            multiline
            className="min-h-[100px] resize-none"
          />
        </>
      );
    }
    return null;
  };

  const renderStep4 = () => {
    return (
      <>
        <h4 className="text-lg font-bold text-slate-800 mb-2">Plan d'abonnement souhaité</h4>
        <p className="text-sm text-slate-500 mb-4">Choisissez le plan qui correspond le mieux à vos besoins.</p>
        <CustomPicker
          label="Plan d'abonnement"
          value={formData.plan_souhaite}
          options={PLAN_ABONNEMENT_OPTIONS}
          onSelect={(v: string) => updateField('plan_souhaite', v)}
        />
        <Input
          label="Message (optionnel)"
          placeholder="Informations complémentaires..."
          value={formData.message_demandeur}
          onChange={(e) => updateField('message_demandeur', e.target.value)}
          multiline
          className="min-h-[100px] resize-none"
        />
      </>
    );
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Créer un établissement</h3>
          <p className="text-sm text-slate-500">
            Remplissez ce formulaire pour soumettre une demande de création d'établissement sur SchoolNet. Un administrateur examinera votre demande.
          </p>
        </div>

        {/* Step indicator */}
        <div className="inline-flex px-4 py-2 bg-blue-50 rounded-full mb-4">
          <span className="text-sm font-semibold text-blue-600">Étape {step} / {totalSteps}</span>
        </div>

        {/* Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Footer */}
        <div className="flex gap-3 justify-end mt-6">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors"
            >
              Précédent
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid()}
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                'Soumettre la demande'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
