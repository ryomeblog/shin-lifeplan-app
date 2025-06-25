import React, { useState, useEffect } from 'react';
import { HiCalculator } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { getLifePlanSettings } from '../../utils/storage';

const FireSettingsForm = ({ onSave }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [fireSettings, setFireSettings] = useState({
    targetAmount: 50000000,
    isEnabled: true,
  });

  useEffect(() => {
    const loadSettings = () => {
      try {
        const settings = getLifePlanSettings();
        setFireSettings(settings.fireSettings || { targetAmount: 50000000, isEnabled: true });
      } catch (error) {
        console.error('FIRE設定読み込みエラー:', error);
      }
    };

    loadSettings();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // 保存処理
      onSave(fireSettings);
    }
    setIsEditMode(!isEditMode);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFireSettings((prev) => ({ ...prev, targetAmount: parseInt(value) || 0 }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FIRE計画</h2>
          <p className="text-sm text-gray-600">経済的自立を達成するための計画を管理します</p>
        </div>
        <Button onClick={handleToggleEditMode}>{isEditMode ? '保存' : '編集'}</Button>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">目標達成時期</h3>
            <p className="text-2xl font-bold text-blue-600">2045年（55歳）</p>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">必要資産額</h3>
            {isEditMode ? (
              <Input
                type="text"
                value={fireSettings.targetAmount?.toLocaleString() || ''}
                onChange={handleAmountChange}
                placeholder="100,000,000"
                className="text-2xl font-bold"
              />
            ) : (
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(fireSettings.targetAmount)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* シミュレーション結果 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">シミュレーション結果</h3>
        <Card>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <HiCalculator className="h-12 w-12 mx-auto mb-4" />
              <p>シミュレーショングラフ</p>
              <p className="text-sm mt-2">今後実装予定</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FireSettingsForm;
