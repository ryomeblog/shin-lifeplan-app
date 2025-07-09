import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { getLifePlanSettings } from '../../utils/storage';

const TransferForm = ({ accounts }) => {
  const [settings, setSettings] = useState(null);

  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    memo: '',
  });

  // ライフプラン設定を読み込み
  useEffect(() => {
    try {
      const lifePlanSettings = getLifePlanSettings();
      setSettings(lifePlanSettings);

      // 初期年を設定（現在年がライフプラン範囲内の場合は現在年、そうでなければ開始年）
      const currentYear = new Date().getFullYear();
      const initialYear =
        currentYear >= lifePlanSettings.planStartYear && currentYear <= lifePlanSettings.planEndYear
          ? currentYear
          : lifePlanSettings.planStartYear;

      setTransferData((prev) => ({ ...prev, year: initialYear }));
    } catch (error) {
      console.error('ライフプラン設定読み込みエラー:', error);
      // エラー時はデフォルト値を設定
      const currentYear = new Date().getFullYear();
      setSettings({
        planStartYear: currentYear - 100,
        planEndYear: currentYear + 100,
      });
    }
  }, []);

  const handleTransfer = () => {
    // TODO: 振替処理の実装
    console.log('振替データ:', transferData);
    alert('振替機能は今後実装予定です');
  };

  // ライフプラン設定が読み込まれるまでローディング表示
  if (!settings) {
    return (
      <div className="lg:col-span-1">
        <Card title="振替登録">
          <div className="text-center py-8 text-gray-500">
            <p>ライフプラン設定を読み込み中...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1">
      <Card title="振替登録">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">振替元</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={transferData.fromAccountId}
              onChange={(e) =>
                setTransferData((prev) => ({ ...prev, fromAccountId: e.target.value }))
              }
            >
              <option value="">口座を選択</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">振替先</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={transferData.toAccountId}
              onChange={(e) =>
                setTransferData((prev) => ({ ...prev, toAccountId: e.target.value }))
              }
            >
              <option value="">口座を選択</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="text"
            placeholder="金額を入力"
            label="金額"
            value={transferData.amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setTransferData((prev) => ({ ...prev, amount: value }));
            }}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={transferData.year}
                onChange={(e) =>
                  setTransferData((prev) => ({ ...prev, year: parseInt(e.target.value) }))
                }
              >
                {Array.from(
                  { length: settings.planEndYear - settings.planStartYear + 1 },
                  (_, i) => {
                    const year = settings.planStartYear + i;
                    return (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    );
                  }
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">月</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={transferData.month}
                onChange={(e) =>
                  setTransferData((prev) => ({ ...prev, month: parseInt(e.target.value) }))
                }
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}月
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            type="text"
            placeholder="メモを入力..."
            label="メモ（任意）"
            value={transferData.memo}
            onChange={(e) => setTransferData((prev) => ({ ...prev, memo: e.target.value }))}
          />

          <Button
            className="w-full"
            onClick={handleTransfer}
            disabled={
              !transferData.fromAccountId || !transferData.toAccountId || !transferData.amount
            }
          >
            振替を実行
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TransferForm;
