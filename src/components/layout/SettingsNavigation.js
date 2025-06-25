import React from 'react';
import { HiCog6Tooth, HiUsers, HiCalculator } from 'react-icons/hi2';
import Card from '../ui/Card';

const SettingsNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'basic', label: '基本設定', icon: HiCog6Tooth },
    { id: 'detail', label: '詳細設定', icon: HiUsers },
    { id: 'fire', label: 'FIRE計画', icon: HiCalculator },
  ];

  return (
    <Card className="sticky top-6">
      <nav className="space-y-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <IconComponent className="h-5 w-5 mr-3" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </Card>
  );
};

export default SettingsNavigation;
