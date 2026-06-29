import React from 'react';
import { useRequestTabs, RequestTabType } from '@/hooks/useRequestTabs';
import RoleRequestsList from './RoleRequestsList';
import EtablissementRequestsList from './EtablissementRequestsList';
import PartenariatRequestsList from './PartenariatRequestsList';
import { Users, Building2, Handshake } from 'lucide-react';

interface TabConfig {
  id: RequestTabType;
  label: string;
  icon: any;
  component: React.ComponentType;
}

const TABS: TabConfig[] = [
  { id: 'roles', label: 'Rôles', icon: Users, component: RoleRequestsList },
  { id: 'etablissements', label: 'Établissements', icon: Building2, component: EtablissementRequestsList },
  { id: 'partenariats', label: 'Partenariats', icon: Handshake, component: PartenariatRequestsList },
];

export default function UserRequestsTabs() {
  const { activeTab, setActiveTab } = useRequestTabs();

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || RoleRequestsList;

  return (
    <div className="flex flex-col h-full">
      {/* Onglets */}
      <div className="flex gap-4 bg-white px-4 py-2 border-b border-slate-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 p-4 overflow-y-auto">
        <ActiveComponent />
      </div>
    </div>
  );
}
