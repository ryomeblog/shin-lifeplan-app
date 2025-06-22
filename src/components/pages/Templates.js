import React from 'react';
import Card from '../ui/Card';

const Templates = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">テンプレート管理</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="支出テンプレート">
          <div className="text-center py-8 text-gray-500">
            <p>支出テンプレートがありません</p>
            <p className="text-sm mt-2">定期的な支出のテンプレートを作成できます</p>
          </div>
        </Card>

        <Card title="収入テンプレート">
          <div className="text-center py-8 text-gray-500">
            <p>収入テンプレートがありません</p>
            <p className="text-sm mt-2">定期的な収入のテンプレートを作成できます</p>
          </div>
        </Card>

        <Card title="投資テンプレート">
          <div className="text-center py-8 text-gray-500">
            <p>投資テンプレートがありません</p>
            <p className="text-sm mt-2">定期的な投資のテンプレートを作成できます</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Templates;
