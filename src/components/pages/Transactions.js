import React from 'react';
import Card from '../ui/Card';

const Transactions = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">取引管理</h1>
      <Card title="取引一覧">
        <div className="text-center py-8 text-gray-500">
          <p>取引データがありません</p>
          <p className="text-sm mt-2">収入・支出・投資などの取引を記録できます</p>
        </div>
      </Card>
    </div>
  );
};

export default Transactions;
