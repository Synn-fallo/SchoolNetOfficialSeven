import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Send, Building2, Landmark, Handshake, Upload, FileText, Eye, ChevronLeft } from 'lucide-react';
import { useInstitutionalRequest, InstitutionalRole } from '@/hooks/useInstitutionalRequest';
import CertificationCheckbox from './CertificationCheckbox';
import InstitutionalRequestPreview from './InstitutionalRequestPreview';
import Toast from '@/components/ui/Toast';

interface InstitutionalRequestFormProps {
  role: InstitutionalRole;
  onSuccess?: () => void;
}

export default function InstitutionalRequestForm({ role, onSuccess }: InstitutionalRequestFormProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { submitRequest, uploading, loading, getRoleLabel, getJustificatifsDescription } = useInstitutionalRequest({ role });
  const [certified, setCertified] = useState(false);
  const [justificatifFile, setJustificatifFile] = useState<File | null>(null);
  const [justificatifName, setJustificatifName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [formData, setFormData] = useState<any>({});

  const getRoleConfig = () => {
    switch (role) {
      case 'chef_etablissement':
        return {
          title: 'Demande de rôle Chef d\'établissement',
          subtitle: 'Rôle : Chef d\'établissement',
          description: 'Remplissez ce formulaire pour demander le rôle de Chef d\'établissement. Après validation, vous pourrez créer votre établissement.',
          icon: Building2,
          iconColor: '#3B82F6',
          fields: [],
        };
      case 'autorite':
        return {
          title: 'Demande de rôle Autorité',
          subtitle: 'Rôle : Autorité institutionnelle',
          description: 'Remplissez ce formulaire pour demander un compte Autorité (Ministère, Direction, etc.).',
          icon: Landmark,
          iconColor: '#8B5CF6',
          fields: [
            { key: 'institution_nom', label: 'Nom de l\'institution', placeholder: 'Ex: Ministère de l\'Éducation', required: true },
            { key: 'fonction', label: 'Fonction', placeholder: 'Votre fonction au sein de l\'institution', required: true },
          ],
        };
      case 'partenaire':
        return {
          title: 'Demande de rôle Partenaire',
          subtitle: 'Rôle : Partenaire SchoolNet',
          description: 'Remplissez ce formulaire pour devenir partenaire de SchoolNet.',
          icon: Handshake,
          iconColor: '#10B981',
          fields: [
            { key: 'organisation_nom', label: 'Nom de l\'organisation', placeholder: 'Ex: UNICEF, Orange, ...', required: true },
            { key: 'secteur', label: 'Secteur d\'activité', placeholder: 'Ex: Télécommunications, ONG, Édition...', required: true },
          ],
        };
      default:
        return null;
    }
  };

  const config = getRoleConfig();
  if (!config) return null;

  const Icon = config.icon;

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setJustificatifFile(file);
        setJustificatifName(file.name);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    const missingFields = config.fields.filter(f => f.required && !formData[f.key]);
    if (missingFields.length > 0) {
      alert('❌ Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!certified) {
      alert('❌ Vous devez certifier sur l\'honneur l\'exactitude des informations fournies.');
      return;
    }

    if (!justificatifFile) {
      alert(`❌ Veuillez joindre un justificatif. ${getJustificatifsDescription(role)}`);
      return;
    }

    const success = await submitRequest(formData, justificatifFile);

    if (success) {
      setToastMessage(`Votre demande de rôle ${getRoleLabel(role)} a bien été envoyée. Vous serez notifié de sa validation.`);
      setToastType('success');
      setShowToast(true);
      
      setTimeout(() => {
        navigate('/app');
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      setToastMessage('Une erreur est survenue. Veuillez réessayer.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
      
      <div className="flex-1 bg-slate-50 overflow-y-auto">
        <div className="max-w-md mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 text-center border-b border-slate-200 shadow-sm mb-4">
            <button
              onClick={() => navigate(-1)}
              className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">{config.title}</h2>
            <p className="text-sm text-slate-500">{config.description}</p>
          </div>

          {/* Section: Informations du demandeur */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">📌 Informations du demandeur</h4>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-sm text-slate-500">Nom complet</span>
              <span className="text-sm font-medium text-slate-800">{profile?.prenom} {profile?.nom}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-800">{user?.email}</span>
            </div>
            {profile?.telephone && (
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-slate-500">Téléphone</span>
                <span className="text-sm font-medium text-slate-800">{profile.telephone}</span>
              </div>
            )}
          </div>

          {/* Section: Champs spécifiques */}
          {config.fields.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">📌 Informations complémentaires</h4>
              <p className="text-xs text-slate-500 mb-4">{config.description}</p>
              
              {config.fields.map((field) => (
                <div key={field.key} className="mb-3 last:mb-0">
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Section: Justificatif */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-1.5">📌 Pièces justificatives</h4>
            <p className="text-xs text-slate-500 mb-3">{getJustificatifsDescription(role)}</p>
            <button
              onClick={handleFileUpload}
              disabled={uploading}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                justificatifFile
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-60`}
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : justificatifFile ? (
                <>
                  <FileText className="h-4 w-4" />
                  <span>{justificatifName}</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Télécharger un justificatif</span>
                </>
              )}
            </button>
          </div>

          {/* Section: Message optionnel */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-1.5">📌 Message complémentaire (optionnel)</h4>
            <textarea
              className="w-full min-h-[80px] p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              placeholder="Ajoutez toute information complémentaire que vous jugez utile..."
              value={formData.message || ''}
              onChange={(e) => updateField('message', e.target.value)}
            />
          </div>

          {/* Section: Certification */}
          <div className="mb-4">
            <CertificationCheckbox 
              checked={certified}
              onToggle={() => setCertified(!certified)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-blue-600 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Prévisualiser</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Envoyer</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            Une copie de cette demande vous sera adressée par email. Vous serez notifié de l'avancement de votre dossier.
          </p>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <h3 className="text-lg font-semibold text-slate-800">Prévisualisation</h3>
              <div className="w-8" />
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <InstitutionalRequestPreview
                role={role}
                formData={formData}
                userName={`${profile?.prenom} ${profile?.nom}`}
                userEmail={user?.email || ''}
                userPhone={profile?.telephone}
                justificatifName={justificatifName || undefined}
              />
            </div>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
