import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HoldingAssetsList from '../layout/HoldingAssetsList';
import AssetSearchList from '../layout/AssetSearchList';
import AssetModal from '../forms/AssetModal';
import Modal from '../ui/Modal';
import TransactionForm from '../forms/TransactionForm';
import { getAssetInfo, getLifePlanSettings, saveAsset, getTransactions } from '../../utils/storage';

const Assets = () => {
  const navigate = useNavigate();

  // ローカルストレージからデータを読み込み
  const [planSettings, setPlanSettings] = useState({
    planStartYear: 2025,
    planEndYear: 2065,
  });
  const [assetInfo, setAssetInfo] = useState([]);
  const [holdingAssets, setHoldingAssets] = useState([]);
  const [isAddHoldingModalOpen, setIsAddHoldingModalOpen] = useState(false);

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

        // 投資取引から保有資産を計算
        const calculatedHoldings = calculateHoldingAssetsFromTransactions(assets, settings);
        setHoldingAssets(calculatedHoldings);
      } catch (error) {
        console.error('Failed to load data from storage:', error);
      }
    };

    loadStorageData();
  }, []);

  // 投資取引から保有資産を計算する関数
  const calculateHoldingAssetsFromTransactions = (assets, settings) => {
    const holdingsMap = new Map();

    // 全年の投資取引を取得
    for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
      try {
        const transactions = getTransactions(year);
        const investmentTransactions = transactions.filter(
          (t) => t.type === 'investment' && t.holdingAssetId
        );

        investmentTransactions.forEach((transaction) => {
          const assetId = transaction.holdingAssetId;

          // 資産情報が存在するかチェック
          const assetExists = assets.find((asset) => asset.id === assetId);
          if (!assetExists) {
            console.warn(`Asset with ID ${assetId} not found in asset list`);
            return; // 資産が存在しない取引はスキップ
          }

          const quantity = transaction.quantity || 0;
          const amount = transaction.amount || 0;
          const isBuy = transaction.transactionSubtype === 'buy';
          const isSell = transaction.transactionSubtype === 'sell';
          const isDividend = transaction.transactionSubtype === 'dividend';

          if (!holdingsMap.has(assetId)) {
            holdingsMap.set(assetId, {
              id: `holding_${assetId}`,
              assetId: assetId,
              totalQuantity: 0, // 総保有数（買付総数）
              soldQuantity: 0, // 売却数
              totalPurchaseAmount: 0, // 買付総額
              totalSellAmount: 0, // 売却総額
              totalDividendAmount: 0, // 配当総額
              purchaseYear: year,
              transactions: [],
            });
          }

          const holding = holdingsMap.get(assetId);
          holding.transactions.push(transaction);

          if (isBuy) {
            holding.totalQuantity += quantity;
            holding.totalPurchaseAmount += Math.abs(amount);
            // 最初の購入年を記録
            if (!holding.purchaseYear || year < holding.purchaseYear) {
              holding.purchaseYear = year;
            }
          } else if (isSell) {
            holding.soldQuantity += quantity;
            holding.totalSellAmount += Math.abs(amount);
          } else if (isDividend) {
            // 配当は数量に影響しないが、配当総額に加算
            holding.totalDividendAmount += Math.abs(amount);
          }
        });
      } catch (error) {
        console.error(`Failed to load transactions for year ${year}:`, error);
      }
    }

    // 買付が存在する資産をすべて返す（現在保有数が0でも含む）
    return Array.from(holdingsMap.values())
      .filter((holding) => holding.totalQuantity > 0)
      .map((holding) => ({
        ...holding,
        // 現在の保有数 = 総保有数 - 売却数
        currentQuantity: holding.totalQuantity - holding.soldQuantity,
      }));
  };

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

  // 全年の株価平均を計算する関数
  const calculateAveragePrice = (asset) => {
    if (asset.priceHistory.length === 0) return 0;
    const totalPrice = asset.priceHistory.reduce((sum, p) => sum + p.price, 0);
    return totalPrice / asset.priceHistory.length;
  };

  // 保有資産の詳細計算
  const getHoldingAssetDetails = (holding) => {
    const asset = assetInfo.find((a) => a.id === holding.assetId);
    if (!asset) return null;

    // 購入時平均評価額（購入総額 ÷ 総保有数）
    const purchaseAveragePrice =
      holding.totalQuantity > 0 ? holding.totalPurchaseAmount / holding.totalQuantity : 0;

    // 売却時平均評価額（売却総額 ÷ 売却数）
    const sellAveragePrice =
      holding.soldQuantity > 0 ? holding.totalSellAmount / holding.soldQuantity : 0;

    // 損益計算: 売却金額 + 配当金額 - 買付金額 (配当を収入として含める)
    const profitLoss =
      holding.totalSellAmount + holding.totalDividendAmount - holding.totalPurchaseAmount;

    // 損益率の計算（買付金額ベース）
    const profitLossRate =
      holding.totalPurchaseAmount > 0 ? (profitLoss / holding.totalPurchaseAmount) * 100 : 0;

    return {
      ...holding,
      asset,
      purchaseAveragePrice,
      sellAveragePrice,
      profitLoss,
      profitLossRate,
      totalPurchaseValue: holding.totalPurchaseAmount, // 購入時平均金額
    };
  };

  // 保有資産データを詳細付きで準備
  const holdingAssetsWithDetails = holdingAssets
    .map((holding) => ({
      ...holding,
      details: getHoldingAssetDetails(holding),
    }))
    .filter((holding) => holding.details !== null);

  // 総資産計算（現在保有している分のみ）
  const totalAssetValue = holdingAssetsWithDetails.reduce((total, holding) => {
    if (holding.details && holding.currentQuantity > 0) {
      const currentPrice = calculateCurrentPrice(holding.details.asset);
      return total + currentPrice * holding.currentQuantity;
    }
    return total;
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

  // 保有資産追加（投資フォームを開く）
  const handleAddHoldingAsset = () => {
    setIsAddHoldingModalOpen(true);
  };

  // 保有資産追加モーダルを閉じる
  const handleCloseAddHoldingModal = () => {
    setIsAddHoldingModalOpen(false);
  };

  // 投資取引保存完了時の処理
  const handleInvestmentTransactionSaved = () => {
    // データを再読み込み
    const loadStorageData = () => {
      try {
        const settings = getLifePlanSettings();
        const assets = getAssetInfo();
        setAssetInfo(assets);

        // 投資取引から保有資産を再計算
        const calculatedHoldings = calculateHoldingAssetsFromTransactions(assets, settings);
        setHoldingAssets(calculatedHoldings);
      } catch (error) {
        console.error('Failed to reload data:', error);
      }
    };

    loadStorageData();
    setIsAddHoldingModalOpen(false);
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
        calculateAverageReturn={calculateAverageReturn}
        calculateAverageDividend={calculateAverageDividend}
        calculateAveragePrice={calculateAveragePrice}
      />

      {/* 資産フォームモーダル */}
      <AssetModal
        isOpen={isAssetFormOpen}
        onClose={() => setIsAssetFormOpen(false)}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        planSettings={planSettings}
      />

      {/* 保有資産追加モーダル（投資フォーム） */}
      <Modal
        isOpen={isAddHoldingModalOpen}
        onClose={handleCloseAddHoldingModal}
        title="保有資産を追加"
        size="large"
      >
        <TransactionForm
          initialType="investment"
          selectedYear={new Date().getFullYear()}
          onSave={handleInvestmentTransactionSaved}
          onCancel={handleCloseAddHoldingModal}
        />
      </Modal>
    </div>
  );
};

export default Assets;
