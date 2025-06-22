import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Tabs from '../ui/Tabs';

const DividendForm = ({ onSave }) => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    dividendPerShare: 0,
  });
  const [jsonData, setJsonData] = useState('');

  // 年選択肢を生成
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year <= currentYear + 40; year++) {
      years.push({ value: year, label: `${year}年` });
    }
    return years;
  };

  const handleFormSave = () => {
    if (formData.year && formData.dividendPerShare > 0) {
      onSave([{ year: formData.year, dividendPerShare: formData.dividendPerShare }]);
      // フォームリセット
      setFormData({
        year: new Date().getFullYear(),
        dividendPerShare: 0,
      });
    } else {
      alert('年と配当金額を正しく入力してください');
    }
  };

  const handleJsonSave = () => {
    try {
      const parsedData = JSON.parse(jsonData);
      if (Array.isArray(parsedData)) {
        const validData = parsedData.filter(
          (d) =>
            d.year &&
            typeof d.year === 'number' &&
            d.dividendPerShare &&
            typeof d.dividendPerShare === 'number'
        );

        if (validData.length > 0) {
          onSave(validData);
          setJsonData('');
        } else {
          alert('有効なデータがありません');
        }
      } else {
        alert('正しいJSON配列形式で入力してください');
      }
    } catch (error) {
      alert('JSON形式が正しくありません');
    }
  };

  // Formタブのコンテンツ
  const FormContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">年</label>
        <Select
          value={formData.year}
          onChange={(value) => setFormData((prev) => ({ ...prev, year: parseInt(value) }))}
          options={generateYearOptions()}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">配当金額</label>
        <Input
          type="number"
          value={formData.dividendPerShare}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              dividendPerShare: parseFloat(e.target.value) || 0,
            }))
          }
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
