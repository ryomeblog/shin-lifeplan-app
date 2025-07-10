import React, { useState, useEffect } from 'react';
import { HiPencilSquare, HiArrowLeft, HiTrash } from 'react-icons/hi2';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import AssetChart from '../layout/AssetChart';
import DividendHistoryList from '../layout/DividendHistoryList';
import DividendForm from '../forms/DividendForm';
import AssetModal from '../forms/AssetModal';
import { getAssetById, getLifePlanSettings, saveAsset, deleteAsset } from '../../utils/storage';

const AssetDetail = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();

  // ローカルストレージからデータを読み込み
  const [planSettings, setPlanSettings] = useState({
    planStartYear: 2025,
    planEndYear: 2065,
  });
  const [asset, setAsset] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // データ読み込み
  useEffect(() => {
    const loadAssetData = () => {
      try {
        setLoading(true);
        setError(null);

        // ライフプラン設定を読み込み
        const settings = getLifePlanSettings();
        setPlanSettings({
          planStartYear: settings.planStartYear,
          planEndYear: settings.planEndYear,
        });

        // 指定された資産IDの資産を読み込み
        const assetData = getAssetById(assetId);
        if (assetData) {
          setAsset(assetData);
        } else {
          setError(`資産ID "${assetId}" が見つかりません`);
        }
      } catch (err) {
        console.error('Failed to load asset data:', err);
        setError('資産データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (assetId) {
      loadAssetData();
    }
  }, [assetId]);

  // 計算関数
  const calculateDividendRate = (year) => {
    const priceData = asset.priceHistory.find((p) => p.year === year);
    const dividendData = asset.dividendHistory.find((d) => d.year === year);

    if (!priceData || !dividendData || priceData.price === 0) return 0;
    return (dividendData.dividendPerShare / priceData.price) * 100;
  };

  // 編集モーダルを開く
  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  // 資産保存
  const handleSaveAsset = (assetData) => {
    try {
      // ローカルストレージに保存
      const success = saveAsset(assetData);

      if (success) {
        setAsset(assetData);
      } else {
        alert('資産の保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('資産の保存中にエラーが発生しました');
    }
  };

  // 配当保存
  const handleSaveDividend = (dividendDataArray) => {
    try {
      const updatedDividendHistory = [...asset.dividendHistory, ...dividendDataArray]
        .reduce((acc, current) => {
          const existing = acc.find((item) => item.year === current.year);
          if (existing) {
            existing.dividendPerShare = current.dividendPerShare;
          } else {
            acc.push(current);
          }
          return acc;
        }, [])
        .sort((a, b) => a.year - b.year);

      const updatedAsset = {
        ...asset,
        dividendHistory: updatedDividendHistory,
      };

      // ローカルストレージに保存
      const success = saveAsset(updatedAsset);

      if (success) {
        setAsset(updatedAsset);
      } else {
        alert('配当データの保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save dividend data:', error);
      alert('配当データの保存中にエラーが発生しました');
    }
  };

  // 資産削除
  const handleDeleteAsset = () => {
    const confirmMessage = `資産「${asset.name}」を削除しますか？\n\nこの操作により以下も同時に削除されます：\n- この資産に関連する保有資産\n- この資産に関連する取引履歴\n\nこの操作は元に戻せません。`;

    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);

      try {
        const success = deleteAsset(asset.id);

        if (success) {
          alert('資産を削除しました');
          navigate('/shin-lifeplan-app/assets');
        } else {
          alert('資産の削除に失敗しました');
        }
      } catch (error) {
        console.error('Failed to delete asset:', error);
        alert('資産の削除中にエラーが発生しました');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <div className="text-center py-8">
            <p>資産データを読み込み中...</p>
          </div>
        </Card>
      </div>
    );
  }

  // エラー状態
  if (error || !asset) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error || '資産が見つかりません'}</p>
            <Button onClick={() => navigate('/shin-lifeplan-app/assets')}>資産一覧に戻る</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* ヘッダー */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/shin-lifeplan-app/assets')}
            >
              <HiArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
              <p className="text-gray-600">銘柄コード: {asset.symbol}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleOpenEditModal}>
              <HiPencilSquare className="h-4 w-4 mr-2" />
              資産を編集
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteAsset}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <HiTrash className="h-4 w-4 mr-2" />
              {isDeleting ? '削除中...' : '資産を削除'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 資産推移グラフ */}
      <Card>
        <AssetChart priceHistory={asset.priceHistory} title="資産推移" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 配当金履歴 */}
        <DividendHistoryList
          dividendHistory={asset.dividendHistory}
          calculateDividendRate={calculateDividendRate}
          formatCurrency={formatCurrency}
        />

        {/* 配当登録 */}
        <DividendForm onSave={handleSaveDividend} />
      </div>

      {/* 編集モーダル */}
      <AssetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveAsset}
        editingAsset={asset}
        planSettings={planSettings}
      />
    </div>
  );
};

export default AssetDetail;
