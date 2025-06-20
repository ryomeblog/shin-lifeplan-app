import React from 'react';
import Card from '../ui/Card';

const Reports = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">レポート・分析</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="資産推移">
          <div className="text-center py-8 text-gray-500">
            <p>データ不足のためグラフを表示できません</p>
          </div>
        </Card>
        <Card title="収支分析">
          <div className="text-center py-8 text-gray-500">
            <p>データ不足のためグラフを表示できません</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
