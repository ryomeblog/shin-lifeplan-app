import React from 'react';
import Card from '../ui/Card';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">設定</h1>
      <div className="space-y-6">
        <Card title="プロフィール設定">
          <div className="text-center py-8 text-gray-500">
            <p>プロフィール設定機能</p>
            <p className="text-sm mt-2">ユーザー情報の管理</p>
          </div>
        </Card>
        <Card title="アプリケーション設定">
          <div className="text-center py-8 text-gray-500">
            <p>アプリケーション設定機能</p>
            <p className="text-sm mt-2">表示設定、通知設定など</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
