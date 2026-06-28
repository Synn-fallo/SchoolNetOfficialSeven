import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase.web';
import { Users, Building2, GraduationCap } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface StatsData {
  etablissements: number;
  utilisateurs: number;
  notes: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsData>({
    etablissements: 0,
    utilisateurs: 0,
    notes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [etablissementsRes, utilisateursRes, notesRes] = await Promise.all([
        supabase.from('public_etablissements').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('notes').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        etablissements: etablissementsRes.count || 0,
        utilisateurs: utilisateursRes.count || 0,
        notes: notesRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      icon: Building2,
      value: stats.etablissements,
      label: 'Établissements',
      suffix: '+',
    },
    {
      icon: Users,
      value: stats.utilisateurs,
      label: 'Utilisateurs',
      suffix: '+',
    },
    {
      icon: GraduationCap,
      value: stats.notes,
      label: 'Notes saisies',
      suffix: 'k',
      divider: 1000,
    },
  ];

  if (loading) {
    return (
      <section className="px-6 py-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-48 h-8 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-4" />
                <div className="w-20 h-10 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-12 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          SchoolNet en chiffres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statItems.map((item, index) => {
            const IconComponent = item.icon;
            const displayValue = item.divider ? Math.floor(item.value / item.divider) : item.value;
            
            return (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <IconComponent size={32} className="text-blue-500" />
                </div>
                <p className="text-4xl font-extrabold text-gray-900 mb-2">
                  <AnimatedNumber value={displayValue} duration={1500} />
                  {item.suffix}
                </p>
                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}