import { 
  BookOpen, 
  MessageCircle, 
  Brain, 
  ShoppingBag, 
  Users, 
  Shield 
} from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: BookOpen,
    title: 'Gestion pédagogique',
    description: 'Notes, devoirs, bulletins et suivi individualisé.',
  },
  {
    icon: MessageCircle,
    title: 'Communication instantanée',
    description: 'Messagerie sécurisée entre parents, enseignants et élèves.',
  },
  {
    icon: Brain,
    title: 'Assistant IA (Chool)',
    description: 'Aide aux devoirs et explications personnalisées.',
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace éducative',
    description: 'Achat et vente de ressources pédagogiques.',
  },
  {
    icon: Users,
    title: 'Communauté scolaire',
    description: 'Forums de classe et groupes d\'entraide.',
  },
  {
    icon: Shield,
    title: 'Contrôle parental',
    description: 'Supervision des activités et restrictions.',
  },
];

interface FeaturesSectionProps {
  features?: Feature[];
}

export default function FeaturesSection({ features = defaultFeatures }: FeaturesSectionProps) {
  return (
    <section className="px-6 py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">
          Fonctionnalités clés
        </h2>
        <p className="text-sm text-gray-500 text-center max-w-lg mx-auto mb-10">
          Tout ce dont vous avez besoin pour une gestion scolaire moderne et efficace
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <IconComponent size={28} className="text-schoolnet-primary" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}