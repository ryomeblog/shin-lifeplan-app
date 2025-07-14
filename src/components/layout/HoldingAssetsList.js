import React from 'react';
import { HiPlus } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';

const HoldingAssetsList = ({
  holdingAssets,
  totalAssetValue,
  onHoldingAssetClick,
  onAddHoldingAsset,
  formatCurrency,
  addBtnRef,
}) => {
  return (
    <Card title="保有資産" subtitle={`総資産: ${formatCurrency(totalAssetValue)}`}>
      <div className="space-y-4">
        {/* ヘッダー */}
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-gray-700">
          <div>資産名</div>
          <div>現在の保有数</div>
          <div>総保有数</div>
          <div>購入時平均評価額</div>
          <div>購入時平均金額</div>
          <div>損益</div>
        </div>

        {/* 保有資産リスト */}
        {holdingAssets.map((holding) => {
          if (!holding.details) return null;

          return (
            <div
              key={holding.id}
              className="grid grid-cols-6 gap-4 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => onHoldingAssetClick(holding.id)}
            >
              <div className="font-medium text-gray-900">{holding.details.asset.name}</div>
              <div className="text-gray-600">
                {holding.currentQuantity}
                {holding.currentQuantity === 0 && (
                  <span className="text-red-500 text-xs ml-1">(売却済)</span>
                )}
              </div>
              <div className="text-gray-600">{holding.totalQuantity}</div>
              <div className="text-gray-600">
                {formatCurrency(holding.details.purchaseAveragePrice)}
              </div>
              <div className="text-gray-600">
                {formatCurrency(holding.details.totalPurchaseValue)}
              </div>
              <div
                className={`font-medium ${holding.details.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {holding.details.profitLoss >= 0 ? '+' : ''}
                {formatCurrency(holding.details.profitLoss)}
                <span className="text-sm ml-1">
                  ({holding.details.profitLossRate >= 0 ? '+' : ''}
                  {holding.details.profitLossRate.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}

        {holdingAssets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>保有資産がありません</p>
            <p className="text-sm mt-2">「保有資産を追加」ボタンで新しい保有資産を登録できます</p>
          </div>
        )}

        {/* 保有資産追加ボタン */}
        <div ref={addBtnRef}>
          <Button
            onClick={onAddHoldingAsset}
            className="w-full flex items-center justify-center space-x-2 py-4"
          >
            <HiPlus className="h-5 w-5" />
            <span>保有資産を追加</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default HoldingAssetsList;
