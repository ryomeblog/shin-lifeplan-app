import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HoldingAssetsList from '../layout/HoldingAssetsList';
import AssetSearchList from '../layout/AssetSearchList';
import AssetModal from '../forms/AssetModal';
import {
  getAssetInfo,
  getHoldingAssets,
  getLifePlanSettings,
  saveAsset,
} from '../../utils/storage';

const Assets = () => {
  const navigate = useNavigate();

  // ローカルストレージからデータを読み込み
  const [planSettings, setPlanSettings] = useState({
    planStartYear: 2025,
    planEndYear: 2065,
  });
  const [assetInfo, setAssetInfo] = useState([]);
  const [holdingAssets, setHoldingAssets] = useState([]);

  // データ読み込み
  useEffect(() => {
    const loadStorageData = () => {
      try {
        const settings = getLifePlanSettings();
        setPlanSettings({
          planStartYear: settings.planStartYear,
          planEndYear: settings.planEndYear,
        });

        const assets = getAssetInfo();
        setAssetInfo(assets);

        const holdings = getHoldingAssets();
        setHoldingAssets(holdings);
      } catch (error) {
        console.error('Failed to load data from storage:', error);
      }
    };

    loadStorageData();
  }, []);

  // 検索・フィルター
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  // 計算用ヘルパー関数
  const calculateCurrentPrice = (asset, currentYear = new Date().getFullYear()) => {
    const priceData = asset.priceHistory
      .filter((p) => p.year <= currentYear)
      .sort((a, b) => b.year - a.year)[0];
    return priceData?.price || 0;
  };

  const calculateAverageReturn = (asset) => {
    if (asset.priceHistory.length < 2) return 0;
    const sortedPrices = asset.priceHistory.sort((a, b) => a.year - b.year);
    const firstPrice = sortedPrices[0].price;
    const lastPrice = sortedPrices[sortedPrices.length - 1].price;
    const years = sortedPrices[sortedPrices.length - 1].year - sortedPrices[0].year;
    return years > 0 ? (Math.pow(lastPrice / firstPrice, 1 / years) - 1) * 100 : 0;
  };

  const calculateAverageDividend = (asset) => {
    if (asset.dividendHistory.length === 0) return 0;
    const totalDividend = asset.dividendHistory.reduce((sum, d) => sum + d.dividendPerShare, 0);
    return totalDividend / asset.dividendHistory.length;
  };

  // 保有資産の詳細計算
  const getHoldingAssetDetails = (holding) => {
    const asset = assetInfo.find((a) => a.id === holding.assetId);
    if (!asset) return null;

    const currentPrice = calculateCurrentPrice(asset);
    const purchasePrice =
      asset.priceHistory.find((p) => p.year === holding.purchaseYear)?.price || currentPrice;
    const currentValue = currentPrice * holding.quantity;
    const purchaseValue = purchasePrice * holding.quantity;
    const profitLoss = currentValue - purchaseValue;
    const profitLossRate = purchaseValue > 0 ? (profitLoss / purchaseValue) * 100 : 0;

    return {
      ...holding,
      asset,
      currentPrice,
      purchasePrice,
      currentValue,
      purchaseValue,
      profitLoss,
      profitLossRate,
    };
  };

  // 保有資産データを詳細付きで準備
  const holdingAssetsWithDetails = holdingAssets
    .map((holding) => ({
      ...holding,
      details: getHoldingAssetDetails(holding),
    }))
    .filter((holding) => holding.details !== null);

  // 総資産計算
  const totalAssetValue = holdingAssetsWithDetails.reduce((total, holding) => {
    return total + (holding.details?.currentValue || 0);
  }, 0);

  // 検索フィルター
  const filteredAssets = assetInfo.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 資産フォーム開く
  const handleOpenAssetForm = (asset = null) => {
    setEditingAsset(asset);
    setIsAssetFormOpen(true);
  };

  // 資産保存
  const handleSaveAsset = (assetData) => {
    try {
      // ローカルストレージに保存
      const success = saveAsset(assetData);

      if (success) {
        // 状態を更新
        if (editingAsset) {
          setAssetInfo((prev) => prev.map((a) => (a.id === editingAsset.id ? assetData : a)));
        } else {
          setAssetInfo((prev) => [...prev, assetData]);
        }
      } else {
        alert('資産の保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('資産の保存中にエラーが発生しました');
    }
  };

  // 保有資産追加（未実装）
  const handleAddHoldingAsset = () => {
    alert('保有資産追加機能は未実装です');
  };

  // 保有資産詳細画面へ遷移
  const handleHoldingAssetDetail = (holdingId) => {
    navigate(`/holding-assets/${holdingId}`);
  };

  // 資産詳細画面へ遷移
  const handleAssetDetail = (assetId) => {
    navigate(`/assets/${assetId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 保有資産セクション */}
      <HoldingAssetsList
        holdingAssets={holdingAssetsWithDetails}
        totalAssetValue={totalAssetValue}
        onHoldingAssetClick={handleHoldingAssetDetail}
        onAddHoldingAsset={handleAddHoldingAsset}
        formatCurrency={formatCurrency}
      />

      {/* 資産検索セクション */}
      <AssetSearchList
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredAssets={filteredAssets}
        onAssetClick={handleAssetDetail}
        onAddAsset={() => handleOpenAssetForm()}
        calculateCurrentPrice={calculateCurrentPrice}
        calculateAverageReturn={calculateAverageReturn}
        calculateAverageDividend={calculateAverageDividend}
        formatCurrency={formatCurrency}
      />

      {/* 資産フォームモーダル */}
      <AssetModal
        isOpen={isAssetFormOpen}
        onClose={() => setIsAssetFormOpen(false)}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        planSettings={planSettings}
      />
    </div>
  );
};

export default Assets;
