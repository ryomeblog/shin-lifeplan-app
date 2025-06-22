import React from 'react';
import Card from '../ui/Card';

const Events = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">イベント管理</h1>
      <Card title="ライフイベント">
        <div className="text-center py-8 text-gray-500">
          <p>ライフイベントがありません</p>
          <p className="text-sm mt-2">結婚、出産、退職などのライフイベントを管理できます</p>
        </div>
      </Card>
    </div>
  );
};

export default Events;
