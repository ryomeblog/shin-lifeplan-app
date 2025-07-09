import React from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';

const FireSettings = ({ formData, onInputChange, errors }) => {
  return (
    <Card
      title="FIRE計画設定"
      subtitle="Financial Independence, Retire Early（経済的自立と早期退職）"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">必要資産額（円）</label>
        <Input
          type="text"
          defaultValue={formData.fireTargetAmount || ''}
          onBlur={(e) => {
            // フォーカスが外れた時にカンマ区切りフォーマットを適用
            const rawValue = e.target.value.replace(/[^0-9]/g, '');
            if (rawValue) {
              const formatted = parseInt(rawValue).toLocaleString();
              onInputChange('fireTargetAmount', formatted);
            } else {
              onInputChange('fireTargetAmount', '');
            }
          }}
          placeholder="例: 50,000,000"
          error={errors.fireTargetAmount}
        />
        {errors.fireTargetAmount && (
          <p className="mt-1 text-sm text-red-600">{errors.fireTargetAmount}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">年間支出の25倍が目安とされています（4%ルール）</p>
      </div>
    </Card>
  );
};

export default FireSettings;
