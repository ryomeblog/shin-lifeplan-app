import React, { useState } from 'react';
import Card from '../ui/Card';
import { getLifePlanSettings, saveLifePlanSettings } from '../../utils/storage';

const DEFAULT_STATUS = {
  dashboard: false,
  transactions: false,
  events: false,
  reports: false,
  accounts: false,
  assets: false,
  templates: false,
  categories: false,
};

const LABELS = {
  dashboard: 'ダッシュボード',
  transactions: '取引',
  events: 'イベント',
  reports: 'レポート',
  accounts: '口座',
  assets: '資産',
  templates: 'テンプレート',
  categories: 'カテゴリ',
};

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
      checked ? 'bg-blue-600' : 'bg-gray-300'
    }`}
    onClick={onChange}
    aria-pressed={checked}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
    <span
      className={`absolute left-1 text-xs font-bold ${checked ? 'text-blue-700' : 'text-gray-500'}`}
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    >
      {checked ? '完了' : '未完了'}
    </span>
  </button>
);

const TutorialManager = () => {
  const [tutorialStatus, setTutorialStatus] = useState(() => {
    const settings = getLifePlanSettings();
    return settings?.tutorialStatus || { ...DEFAULT_STATUS };
  });

  const handleToggle = (key) => {
    const newStatus = { ...tutorialStatus, [key]: !tutorialStatus[key] };
    setTutorialStatus(newStatus);
    const settings = getLifePlanSettings();
    saveLifePlanSettings({
      ...settings,
      tutorialStatus: newStatus,
    });
  };

  const handleReset = () => {
    setTutorialStatus({ ...DEFAULT_STATUS });
    const settings = getLifePlanSettings();
    saveLifePlanSettings({
      ...settings,
      tutorialStatus: { ...DEFAULT_STATUS },
    });
  };

  return (
    <Card title="チュートリアル管理">
      <div className="space-y-4">
        {Object.entries(tutorialStatus).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span>{LABELS[key] || key}</span>
            <Toggle checked={!!value} onChange={() => handleToggle(key)} />
          </div>
        ))}
        <button
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          onClick={handleReset}
        >
          すべてリセット
        </button>
      </div>
    </Card>
  );
};

export default TutorialManager;
