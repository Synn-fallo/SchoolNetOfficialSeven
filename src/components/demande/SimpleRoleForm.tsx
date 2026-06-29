import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, GraduationCap, Users, BookOpen } from 'lucide-react';
import { useSimpleRoleRequest } from '@/hooks/useSimpleRoleRequest';

interface SimpleRoleFormProps {
  role: 'eleve' | 'parent' | 'enseignant';
  onSuccess?: () => void;
}

export default function SimpleRoleForm({ role, onSuccess }: SimpleRoleFormProps) {
  const navigate = useNavigate();
  const { submitRequest, loading } = useSimpleRoleRequest({ role });
  const [formData, setFormData] = useState<any>({});

  const getRoleConfig = () => {
    switch (role) {
      case 'eleve':
        return {
          title: 'Demande de rôle Élève',
          description: 'Remplissez ce formulaire pour demander un compte élève.',
          icon: GraduationCap,
          iconColor: '#3B82F6',
          fields: [
            { key: 'classe', label: 'Classe / Niveau', placeholder: 'Ex: 3ème A, Terminale C...', required: true },
            { key: 'matricule', label: 'Matricule (optionnel)', placeholder: 'Votre matricule scolaire', required: false },
          ],
        };
      case 'parent':
        return {
          title: 'Demande de rôle Parent',
          description: 'Remplissez ce formulaire pour demander un compte parent.',
          icon: Users,
          iconColor: '#10B981',
          fields: [
            { key: 'enfants', label: 'Noms des enfants', placeholder: 'Ex: Jean Dupont (CM2), Marie Dupont (6ème)', required: true, multiline: true },
            { key: 'telephone_parent', label: 'Téléphone', placeholder: 'Votre numéro de téléphone', required: true },
          ],
        };
      case 'enseignant':
        return {
          title: 'Demande de rôle Enseignant',
          description: 'Remplissez ce formulaire pour demander un compte enseignant.',
          icon: BookOpen,
          iconColor: '#F59E0B',
          fields: [
            { key: 'diplomes', label: 'Diplômes obtenus', placeholder: 'Ex: Licence, Master, CAP...', required: true, multiline: true },
            { key: 'specialite', label: 'Spécialité', placeholder: 'Ex: Mathématiques, Français, Anglais...', required: true },
            { key: 'annees_experience', label: "Années d'expérience", placeholder: "Nombre d'années", required: true, keyboardType: 'numeric' },
          ],
        };
      default:
        return null;
    }
  };

  const config = getRoleConfig();
  if (!config) return null;

  const Icon = config.icon;

  const handleSubmit = async () => {
    const missingFields = config.fields.filter(f => f.required && !formData[f.key]);
    if (missingFields.length > 0) {
      alert('❌ Veuillez remplir tous les champs obligatoires.');
      return;
    }
  
    const success = await submitRequest({
      role,
      ...formData,
    });
  
    if (success) {
      alert(`✅ Votre rôle ${role} a été activé. Redirection vers votre tableau de bord...`);
      if (onSuccess) onSuccess();
      navigate('/app');
    } else {
      alert('❌ Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 text-center border-b border-slate-200 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${config.iconColor}10` }}>
            <Icon className="h-8 w-8" style={{ color: config.iconColor }} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{config.title}</h2>
          <p className="text-sm text-slate-500">{config.description}</p>
        </div>

        {/* Form */}
        <div className="mt-4 space-y-4">
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {field.multiline ? (
                <textarea
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px] resize-none"
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                />
              ) : (
                <input
                  type={field.keyboardType === 'numeric' ? 'number' : 'text'}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
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
        </div>
      </div>
    </div>
  );
}
