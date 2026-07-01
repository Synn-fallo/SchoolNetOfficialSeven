// /src/components/enseignant/InvitationForm.tsx
// Formulaire d'invitation d'un enseignant

import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Building2, BookOpen, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase.web';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface InvitationFormProps {
  etablissementId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Matiere {
  id: string;
  nom: string;
  code: string;
}

interface Classe {
  id: string;
  nom: string;
  niveau: string;
}

export default function InvitationForm({ etablissementId, onSuccess, onCancel }: InvitationFormProps) {
  const { user, isAnimateurEtablissement, getAdminMetadata } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingPlafond, setCheckingPlafond] = useState(false);
  const [plafondInfo, setPlafondInfo] = useState<{ allowed: boolean; remaining: number; plafond: number } | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    departement: '',
    matieres: [] as string[],
    classes: [] as string[],
  });

  const [matieresList, setMatieresList] = useState<Matiere[]>([]);
  const [classesList, setClassesList] = useState<Classe[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const isAE = isAnimateurEtablissement;
  const aeMetadata = isAE ? getAdminMetadata() : null;
  const defaultDepartement = aeMetadata?.departement || '';

  useEffect(() => {
    loadOptions();
    if (isAE && defaultDepartement) {
      setFormData(prev => ({ ...prev, departement: defaultDepartement }));
      checkPlafond();
    }
  }, []);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      
      const { data: matieres } = await supabase
        .from('matieres')
        .select('id, nom, code')
        .eq('etablissement_id', etablissementId)
        .order('nom');
      
      setMatieresList(matieres || []);
      
      const { data: classes } = await supabase
        .from('classes')
        .select('id, nom, niveau')
        .eq('etablissement_id', etablissementId)
        .eq('is_active', true)
        .order('nom');
      
      setClassesList(classes || []);
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const checkPlafond = async () => {
    if (!isAE || !formData.departement) return;
    
    setCheckingPlafond(true);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-plafond-ae`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          ae_id: user?.id,
          departement: formData.departement,
          etablissement_id: etablissementId,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setPlafondInfo({
          allowed: result.allowed,
          remaining: result.remaining,
          plafond: result.plafond,
        });
      }
    } catch (error) {
      console.error('Error checking plafond:', error);
    } finally {
      setCheckingPlafond(false);
    }
  };

  const toggleMatiere = (matiereId: string) => {
    setFormData(prev => ({
      ...prev,
      matieres: prev.matieres.includes(matiereId)
        ? prev.matieres.filter(id => id !== matiereId)
        : [...prev.matieres, matiereId],
    }));
  };

  const toggleClasse = (classeId: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(classeId)
        ? prev.classes.filter(id => id !== classeId)
        : [...prev.classes, classeId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.nom || !formData.prenom) {
      window.alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isAE && plafondInfo && !plafondInfo.allowed) {
      window.alert(plafondInfo.remaining === 0 
        ? 'Vous ne pouvez plus inviter d\'enseignants. Contactez le Directeur des Études.'
        : 'Limite d\'invitations atteinte');
      return;
    }

    setLoading(true);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-enseignant-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone || null,
          etablissement_id: etablissementId,
          departement: formData.departement || null,
          matieres: formData.matieres,
          classes: formData.classes,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.alert('Invitation envoyée avec succès');
        if (onSuccess) onSuccess();
      } else {
        window.alert(result.error || 'Impossible d\'envoyer l\'invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      window.alert('Impossible d\'envoyer l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <Card className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-schoolnet-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Chargement des options...</p>
      </Card>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-4 pb-8 max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-5">
          <UserPlus className="w-8 h-8 text-schoolnet-primary mx-auto" />
          <h2 className="text-xl font-bold text-gray-800 mt-3 mb-1">Inviter un enseignant</h2>
          <p className="text-sm text-gray-500">
            {isAE ? 'Invitation limitée à votre département' : 'Invitation valable pour tout l\'établissement'}
          </p>
        </div>

        {/* Alerte plafond */}
        {isAE && plafondInfo && (
          <div className={`flex flex-row items-start gap-3 p-3 rounded-lg mb-4 ${plafondInfo.allowed ? 'bg-blue-50' : 'bg-amber-50'}`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plafondInfo.allowed ? 'text-emerald-500' : 'text-amber-500'}`} />
            <p className={`text-sm ${plafondInfo.allowed ? 'text-blue-700' : 'text-amber-700'}`}>
              {plafondInfo.allowed 
                ? `Vous pouvez encore inviter ${plafondInfo.remaining} enseignant(s) (limite: ${plafondInfo.plafond})`
                : `Plafond atteint (${plafondInfo.plafond}/${plafondInfo.plafond}). Contactez le Directeur des Études.`}
            </p>
          </div>
        )}

        {/* Formulaire */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Informations personnelles</h3>
          
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="enseignant@ecole.com"
            className="mb-3"
          />
          
          <div className="flex flex-row gap-3 mb-3">
            <Input
              label="Nom *"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              placeholder="Nom"
              className="flex-1"
            />
            <Input
              label="Prénom *"
              value={formData.prenom}
              onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
              placeholder="Prénom"
              className="flex-1"
            />
          </div>
          
          <Input
            label="Téléphone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
            placeholder="+229 99 00 00 00"
          />

          {!isAE && (
            <Input
              label="Département (optionnel)"
              value={formData.departement}
              onChange={(e) => setFormData(prev => ({ ...prev, departement: e.target.value }))}
              placeholder="Mathématiques, Sciences, Lettres..."
              className="mt-3"
            />
          )}
        </Card>

        {/* Matières */}
        <Card className="p-4 mb-4">
          <div className="flex flex-row items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Matières</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">Sélectionnez les matières que l'enseignant pourra enseigner</p>
          
          <div className="flex flex-row flex-wrap gap-2">
            {matieresList.map((matiere) => (
              <button
                key={matiere.id}
                onClick={() => toggleMatiere(matiere.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm transition-colors
                  ${formData.matieres.includes(matiere.id)
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {matiere.nom}
              </button>
            ))}
          </div>
        </Card>

        {/* Classes */}
        <Card className="p-4 mb-4">
          <div className="flex flex-row items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Classes</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">Sélectionnez les classes auxquelles l'enseignant pourra être affecté</p>
          
          <div className="flex flex-row flex-wrap gap-2">
            {classesList.map((classe) => (
              <button
                key={classe.id}
                onClick={() => toggleClasse(classe.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm transition-colors
                  ${formData.classes.includes(classe.id)
                    ? 'bg-schoolnet-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {classe.nom}
              </button>
            ))}
          </div>
        </Card>

        {/* Boutons */}
        <div className="flex flex-row gap-3 mt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || (isAE &&
