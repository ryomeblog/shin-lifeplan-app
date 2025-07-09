import React from 'react';
import Card from '../ui/Card';
import Select from '../ui/Select';

const PlanRangeSettings = ({ formData, onInputChange, errors }) => {
  const currentYear = new Date().getFullYear();

  // 開始年の選択肢を生成（現在年-100年から現在年+100年後まで）
  const startYearOptions = Array.from({ length: 201 }, (_, i) => ({
    value: currentYear - 100 + i,
    label: `${currentYear - 100 + i}年`,
  }));

  // 終了年の選択肢を生成（現在年-100年から現在年+100年後まで）
  const endYearOptions = Array.from({ length: 201 }, (_, i) => ({
    value: currentYear - 100 + i,
    label: `${currentYear - 100 + i}年`,
  }));

  return (
    <Card title="ライフプラン範囲設定">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始年</label>
          <Select
            options={startYearOptions}
            value={formData.planStartYear}
            onChange={(e) => onInputChange('planStartYear', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">終了年</label>
          <Select
            options={endYearOptions}
            value={formData.planEndYear}
            onChange={(e) => onInputChange('planEndYear', parseInt(e.target.value))}
            error={errors.planEndYear}
          />
          {errors.planEndYear && <p className="mt-1 text-sm text-red-600">{errors.planEndYear}</p>}
        </div>
      </div>
    </Card>
  );
};

export default PlanRangeSettings;
