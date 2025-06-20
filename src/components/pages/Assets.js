import React from 'react';
import Card from '../ui/Card';

const Assets = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">資産管理</h1>
      <Card title="資産一覧">
        <div className="text-center py-8 text-gray-500">
          <p>登録された資産がありません</p>
          <p className="text-sm mt-2">株式、投資信託、不動産などの資産を管理できます</p>
        </div>
      </Card>
    </div>
  );
};

export default Assets;
