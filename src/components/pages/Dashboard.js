import React from 'react';
import Card from '../ui/Card';

const Dashboard = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="総資産">
          <p className="text-2xl font-bold text-green-600">¥0</p>
          <p className="text-sm text-gray-500">前月比: --</p>
        </Card>
        <Card title="月次収支">
          <p className="text-2xl font-bold text-blue-600">¥0</p>
          <p className="text-sm text-gray-500">今月の収支</p>
        </Card>
        <Card title="FIRE進捗">
          <p className="text-2xl font-bold text-orange-600">0%</p>
          <p className="text-sm text-gray-500">目標達成まで</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
