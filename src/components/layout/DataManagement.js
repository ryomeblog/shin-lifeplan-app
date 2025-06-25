import React from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const DataManagement = ({ onExport, onImport }) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">データ管理</h2>
        <p className="text-sm text-gray-600">データのバックアップと復元を行います</p>
      </div>

      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">データのエクスポート</h3>
              <p className="text-sm text-gray-600">
                すべてのデータをJSONファイルとしてエクスポートします
              </p>
            </div>
            <Button onClick={onExport}>エクスポート</Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-gray-900">データのインポート</h3>
              <p className="text-sm text-gray-600">
                エクスポートしたJSONファイルからデータを復元します
              </p>
            </div>
            <Button variant="outline" onClick={onImport}>
              インポート
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DataManagement;
