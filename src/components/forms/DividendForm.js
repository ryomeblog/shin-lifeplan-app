import React, { useState, useRef } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Tabs from '../ui/Tabs';
import { getLifePlanSettings } from '../../utils/storage';

const DividendForm = ({ onSave }) => {
  // 配当金額入力用のref（uncontrolled component）
  const dividendRef = useRef(null);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    dividendPerShare: 0,
  });
  const [jsonData, setJsonData] = useState('');

  // ライフプラン範囲に基づいた年選択肢を生成
  const generateYearOptions = () => {
    try {
      const settings = getLifePlanSettings();
      const startYear = settings.planStartYear;
      const endYear = settings.planEndYear;

      const years = [];
      for (let year = startYear; year <= endYear; year++) {
        years.push({ value: year, label: `${year}年` });
      }
      return years;
    } catch (error) {
      console.error('ライフプラン設定の取得に失敗しました:', error);
      // フォールバック：現在年-100から200年間
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear - 100; year <= currentYear + 100; year++) {
        years.push({ value: year, label: `${year}年` });
      }
      return years;
    }
  };

  // 配当金額のブラー処理（フォーカスが離れた時に実際のフォームデータを更新）
  const handleDividendBlur = () => {
    if (dividendRef.current) {
      const value = parseFloat(dividendRef.current.value) || 0;
      setFormData((prev) => ({
        ...prev,
        dividendPerShare: value,
      }));
    }
  };

  const handleFormSave = () => {
    // 保存前にrefから最新の配当金額を取得
    const currentDividend = dividendRef.current
      ? parseFloat(dividendRef.current.value) || 0
      : formData.dividendPerShare;

    if (formData.year && currentDividend > 0) {
      onSave([{ year: formData.year, dividendPerShare: currentDividend }]);

      // フォームリセット
      setFormData({
        year: new Date().getFullYear(),
        dividendPerShare: 0,
      });

      // refもリセット
      if (dividendRef.current) {
        dividendRef.current.value = '0';
      }
    } else {
      alert('年と配当金額を正しく入力してください');
    }
  };

  const handleJsonSave = () => {
    try {
      const parsedData = JSON.parse(jsonData);
      if (Array.isArray(parsedData)) {
        // ライフプラン範囲内の年のみを有効とする
        const settings = getLifePlanSettings();
        const startYear = settings.planStartYear;
        const endYear = settings.planEndYear;

        const validData = parsedData.filter(
          (d) =>
            d.year &&
            typeof d.year === 'number' &&
            d.year >= startYear &&
            d.year <= endYear &&
            d.dividendPerShare &&
            typeof d.dividendPerShare === 'number'
        );

        if (validData.length > 0) {
          onSave(validData);
          setJsonData('');

          // 範囲外のデータがあった場合の警告
          if (validData.length < parsedData.length) {
            alert(
              `${parsedData.length - validData.length}件のデータがライフプラン範囲外（${startYear}年-${endYear}年）のため除外されました`
            );
          }
        } else {
          alert(
            `有効なデータがありません。年は${startYear}年から${endYear}年の範囲で入力してください。`
          );
        }
      } else {
        alert('正しいJSON配列形式で入力してください');
      }
    } catch (error) {
      console.error('JSON保存エラー:', error);
      alert('JSON形式が正しくありません');
    }
  };

  // 現在のライフプラン範囲を取得して表示用
  const getLifePlanRange = () => {
    try {
      const settings = getLifePlanSettings();
      return `${settings.planStartYear}年 - ${settings.planEndYear}年`;
    } catch (error) {
      return '設定取得エラー';
    }
  };

  // Formタブのコンテンツ
  const FormContent = (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
        ライフプラン範囲: {getLifePlanRange()}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">年</label>
        <Select
          value={formData.year}
          onChange={(e) => setFormData((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
          options={generateYearOptions()}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">配当金額</label>
        <Input
          ref={dividendRef}
          type="number"
          defaultValue={formData.dividendPerShare}
          onBlur={handleDividendBlur}
          placeholder="¥"
          min="0"
        />
      </div>
      <Button onClick={handleFormSave} className="w-full">
        配当を登録
      </Button>
    </div>
  );

  // JSONタブのコンテンツ
  const JsonContent = (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
        ライフプラン範囲: {getLifePlanRange()}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">JSON配当データ</label>
        <textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
          placeholder={`[
  {
    "year": 2025,
    "dividendPerShare": 60
  }
]`}
        />
        <p className="text-xs text-gray-500 mt-1">※ 年はライフプラン範囲内で入力してください</p>
      </div>
      <Button onClick={handleJsonSave} className="w-full">
        配当を登録
      </Button>
    </div>
  );

  return (
    <Card title="配当登録">
      <div className="space-y-4">
        <Tabs
          tabs={[
            {
              label: 'Form',
              content: FormContent,
            },
            {
              label: 'JSON',
              content: JsonContent,
            },
          ]}
          defaultTab={0}
        />
      </div>
    </Card>
  );
};

export default DividendForm;
