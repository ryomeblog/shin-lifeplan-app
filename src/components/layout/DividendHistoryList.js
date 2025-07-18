import React from 'react';
import Card from '../ui/Card';

const DividendHistoryList = ({ dividendHistory, calculateDividendRate, formatCurrency }) => {
  return (
    <Card title="配当金履歴">
      <div className="space-y-4">
        {/* ヘッダー */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-gray-700">
          <div>年</div>
          <div>配当金額</div>
          <div>配当率</div>
        </div>

        {/* 配当データ（スクロール可能） */}
        <div className="max-h-96 overflow-y-auto">
          {dividendHistory.map((dividend) => (
            <div key={dividend.year} className="grid grid-cols-3 gap-4 p-3 border rounded-lg mb-2">
              <div className="text-gray-600">{dividend.year}年</div>
              <div className="text-gray-900">{formatCurrency(dividend.dividendPerShare)}</div>
              <div className="text-green-600 font-medium">
                {calculateDividendRate(dividend.year).toFixed(1)}%
              </div>
            </div>
          ))}

          {dividendHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>配当履歴がありません</p>
            </div>
          )}
        </div>

        {/* データ件数表示 */}
        {dividendHistory.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            配当履歴: {dividendHistory.length}件
          </div>
        )}
      </div>
    </Card>
  );
};

export default DividendHistoryList;
