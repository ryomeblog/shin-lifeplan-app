import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getLifePlanSettings, getActiveLifePlan, updateLifePlan } from '../../utils/storage';

const BasicSettingsForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    lifePlanName: '',
    planStartYear: 2025,
    planEndYear: 2065,
  });

  useEffect(() => {
    const loadSettings = () => {
      try {
        const settings = getLifePlanSettings();
        const activeLifePlan = getActiveLifePlan();

        setFormData((prev) => ({
          ...prev,
          lifePlanName: activeLifePlan?.name || '',
          planStartYear: settings.planStartYear,
          planEndYear: settings.planEndYear,
        }));
      } catch (error) {
        console.error('設定読み込みエラー:', error);
      }
    };

    loadSettings();
  }, []);

  // 現在年から±100年の範囲で年のオプションを生成
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear + 100; year++) {
      years.push(year);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  const handleSubmit = (e) => {
    e.preventDefault();

    // バリデーション
    if (!formData.lifePlanName.trim()) {
      alert('ライフプラン名を入力してください');
      return;
    }

    if (formData.planStartYear >= formData.planEndYear) {
      alert('終了年は開始年より後である必要があります');
      return;
    }

    // アクティブなライフプランを更新
    try {
      const activeLifePlan = getActiveLifePlan();
      if (activeLifePlan) {
        const updatedPlan = {
          ...activeLifePlan,
          name: formData.lifePlanName,
          settings: {
            ...activeLifePlan.settings,
            planStartYear: formData.planStartYear,
            planEndYear: formData.planEndYear,
          },
          updatedAt: new Date().toISOString(),
        };

        const success = updateLifePlan(updatedPlan);
        if (success) {
          onSave(formData);
        } else {
          alert('設定の保存に失敗しました');
        }
      } else {
        alert('アクティブなライフプランが見つかりません');
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      alert('設定の保存中にエラーが発生しました');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">基本設定</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ライフプラン名 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.lifePlanName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lifePlanName: e.target.value }))}
              placeholder="ライフプラン名を入力"
              className="max-w-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">通貨</label>
            <div className="max-w-md p-3 bg-gray-50 border border-gray-300 rounded-md">
              <span className="text-gray-600">日本円（JPY）</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">ライフプラン範囲</label>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始年</label>
                <select
                  value={formData.planStartYear}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, planStartYear: parseInt(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">終了年</label>
                <select
                  value={formData.planEndYear}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, planEndYear: parseInt(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button type="submit">変更を保存</Button>
      </div>
    </form>
  );
};

export default BasicSettingsForm;
