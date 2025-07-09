import React, { useRef } from 'react';
import { HiPlus, HiMagnifyingGlass } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

const AssetSearchList = ({
  searchTerm,
  onSearchChange,
  filteredAssets,
  onAssetClick,
  onAddAsset,
  calculateAverageReturn,
  calculateAverageDividend,
  calculateAveragePrice,
}) => {
  const inputRef = useRef(null);

  const handleSearchBlur = () => {
    if (inputRef.current) {
      const value = inputRef.current.value;
      onSearchChange(value);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (inputRef.current) {
        const value = inputRef.current.value;
        onSearchChange(value);
      }
    }
  };

  return (
    <Card
      title="資産検索"
      actions={
        <Button onClick={onAddAsset} size="sm" className="flex items-center space-x-1">
          <HiPlus className="h-4 w-4" />
          <span>新規資産追加</span>
        </Button>
      }
    >
      <div className="space-y-4">
        {/* 検索フォーム */}
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="資産IDまたは資産名で検索..."
            defaultValue={searchTerm}
            onBlur={handleSearchBlur}
            onKeyDown={handleSearchKeyDown}
            className="pl-10"
          />
        </div>

        {/* 検索結果ヘッダー */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-gray-700">
          <div>資産ID</div>
          <div>資産名</div>
          <div>平均年率</div>
          <div>平均配当利回り</div>
        </div>

        {/* 検索結果 */}
        {filteredAssets.map((asset) => {
          const averagePrice = calculateAveragePrice(asset);
          const averageDividend = calculateAverageDividend(asset);
          const dividendYield = averagePrice > 0 ? (averageDividend / averagePrice) * 100 : 0;

          return (
            <div
              key={asset.id}
              className="grid grid-cols-4 gap-4 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => onAssetClick(asset.id)}
            >
              <div className="text-gray-600">{asset.symbol}</div>
              <div className="font-medium text-gray-900">{asset.name}</div>
              <div
                className={`font-medium ${calculateAverageReturn(asset) >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {calculateAverageReturn(asset) >= 0 ? '+' : ''}
                {calculateAverageReturn(asset).toFixed(1)}%
              </div>
              <div className="text-green-600">{dividendYield.toFixed(1)}%</div>
            </div>
          );
        })}

        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>検索結果がありません</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AssetSearchList;
