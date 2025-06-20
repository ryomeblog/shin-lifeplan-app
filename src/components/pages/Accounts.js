import React from 'react';
import Card from '../ui/Card';

const Accounts = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">口座管理</h1>
      <Card title="口座一覧">
        <div className="text-center py-8 text-gray-500">
          <p>登録された口座がありません</p>
          <p className="text-sm mt-2">銀行口座、証券口座などを管理できます</p>
        </div>
      </Card>
    </div>
  );
};

export default Accounts;
