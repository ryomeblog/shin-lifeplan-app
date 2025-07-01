import React, { useState, useEffect } from 'react';
import { HiArrowLeft, HiPlus, HiMinus } from 'react-icons/hi2';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import Modal from '../ui/Modal';
import TransactionForm from '../forms/TransactionForm';
import HoldingAssetChart from '../layout/HoldingAssetChart';
import {
  getAssetInfo,
  getLifePlanSettings,
  getTransactions,
  getAccounts,
} from '../../utils/storage';

const HoldingAssetDetail = () => {
  const { holdingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [holdingAsset, setHoldingAsset] = useState(null);
  const [asset, setAsset] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [investmentSummary, setInvestmentSummary] = useState(null);

  // 取引フォーム関連のstate
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionSubtype, setTransactionSubtype] = useState('buy');

  // データ読み込み
  useEffect(() => {
    const loadHoldingAssetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 基本データを取得
        const settings = getLifePlanSettings();
        const assets = getAssetInfo();
        const accountsData = getAccounts();

        // holdingIdから資産IDを抽出 (holding_${assetId} 形式)
        const assetId = holdingId.replace('holding_', '');
        const targetAsset = assets.find((a) => a.id === assetId);

        if (!targetAsset) {
          setError(`資産ID "${assetId}" が見つかりません`);
          return;
        }

        setAsset(targetAsset);

        // 全年の投資取引を取得して、該当資産の取引を抽出
        const allTransactions = [];
        let currentQuantity = 0;
        let totalQuantity = 0;
        let soldQuantity = 0;
        let totalPurchaseAmount = 0;
        let totalSellAmount = 0;
        let firstPurchaseYear = null;

        for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
          try {
            const yearTransactions = getTransactions(year);
            const assetTransactions = yearTransactions.filter(
              (t) => t.type === 'investment' && t.holdingAssetId === assetId
            );

            assetTransactions.forEach((transaction) => {
              const quantity = transaction.quantity || 0;
              const amount = transaction.amount || 0;
              const isBuy = transaction.transactionSubtype === 'buy';

              // 取引データを整形
              const formattedTransaction = {
                id: transaction.id,
                date: `${transaction.year}/${String(transaction.month).padStart(2, '0')}`,
                type: 'investment',
                subType: transaction.transactionSubtype,
                quantity: quantity,
                price: getAssetPriceForYear(targetAsset, transaction.year),
                amount: Math.abs(amount),
                account: getAccountName(
                  transaction.toAccountId || transaction.accountId,
                  accountsData
                ),
                year: transaction.year,
                month: transaction.month,
              };

              allTransactions.push(formattedTransaction);

              // 投資サマリーデータを計算
              if (isBuy) {
                currentQuantity += quantity;
                totalQuantity += quantity;
                totalPurchaseAmount += Math.abs(amount);
                if (!firstPurchaseYear || year < firstPurchaseYear) {
                  firstPurchaseYear = year;
                }
              } else {
                currentQuantity -= quantity;
                soldQuantity += quantity;
                totalSellAmount += Math.abs(amount);
              }
            });
          } catch (error) {
            console.error(`Failed to load transactions for year ${year}:`, error);
          }
        }

        // 投資サマリーを設定
        const summary = {
          currentQuantity,
          totalQuantity,
          soldQuantity,
          totalPurchaseAmount,
          totalSellAmount,
          // 損益計算: 売却金額の合計 - 買付金額の合計
          profitLoss: totalSellAmount - totalPurchaseAmount,
        };

        // 損益率の計算（買付金額ベース）
        summary.profitLossRate =
          totalPurchaseAmount > 0 ? (summary.profitLoss / totalPurchaseAmount) * 100 : 0;

        setInvestmentSummary(summary);

        // 保有資産データを作成
        const holdingData = {
          id: holdingId,
          assetId: assetId,
          quantity: currentQuantity,
          purchaseYear: firstPurchaseYear || new Date().getFullYear(),
          sellYear: null,
          accountId: null, // 複数口座にまたがる可能性があるためnull
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setHoldingAsset(holdingData);
        setTransactions(
          allTransactions.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          })
        );

        // 買付履歴がない場合のエラー
        if (totalQuantity <= 0) {
          setError('この資産の買付履歴がありません');
          return;
        }
      } catch (err) {
        console.error('Failed to load holding asset data:', err);
        setError('保有資産データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (holdingId) {
      loadHoldingAssetData();
    }
  }, [holdingId]);

  // 指定年の資産価格を取得
  const getAssetPriceForYear = (asset, year) => {
    const priceData = asset.priceHistory?.find((p) => p.year === year);
    return priceData?.price || 0;
  };

  // 口座名を取得
  const getAccountName = (accountId, accountsData) => {
    const account = accountsData.find((acc) => acc.id === accountId);
    return account ? account.name : '不明な口座';
  };

  // 計算関数
  const getCurrentPrice = () => {
    if (!asset) return 0;
    const currentYear = new Date().getFullYear();
    const priceData = asset.priceHistory
      .filter((p) => p.year <= currentYear)
      .sort((a, b) => b.year - a.year)[0];
    return priceData?.price || 0;
  };

  const getCurrentValue = () => {
    if (!holdingAsset) return 0;
    return getCurrentPrice() * holdingAsset.quantity;
  };

  // 買付ボタンクリック処理
  const handleBuyClick = () => {
    setTransactionSubtype('buy');
    setIsTransactionModalOpen(true);
  };

  // 売却ボタンクリック処理
  const handleSellClick = () => {
    setTransactionSubtype('sell');
    setIsTransactionModalOpen(true);
  };

  // 取引フォームモーダルを閉じる
  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
  };

  // 取引保存完了時の処理
  const handleTransactionSaved = () => {
    // データを再読み込み
    window.location.reload(); // 簡易的にページリロード
    setIsTransactionModalOpen(false);
  };

  // 事前設定された取引データを作成
  const getPresetTransactionData = () => {
    if (!asset) return null;

    return {
      type: 'investment',
      transactionSubtype: transactionSubtype,
      holdingAssetId: asset.id,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    };
  };

  // フィルター適用
  const getFilteredTransactions = () => {
    if (transactionFilter === 'all') return transactions;
    if (transactionFilter === 'buy') return transactions.filter((t) => t.subType === 'buy');
    if (transactionFilter === 'sell') return transactions.filter((t) => t.subType === 'sell');
    if (transactionFilter === 'dividend') return []; // 配当取引は今回未実装
    return transactions;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return dateString;
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <div className="text-center py-8">
            <p>保有資産データを読み込み中...</p>
          </div>
        </Card>
      </div>
    );
  }

  // エラー状態
  if (error || !holdingAsset || !asset || !investmentSummary) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error || '保有資産が見つかりません'}</p>
            <Button onClick={() => navigate('/assets')}>資産一覧に戻る</Button>
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
            <Button variant="outline" size="sm" onClick={() => navigate('/assets')}>
              <HiArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
              <p className="text-gray-600">銘柄コード: {asset.symbol}</p>
              <div className="flex items-center space-x-6 text-gray-600 mt-2">
                <span>現在の保有数: {holdingAsset.quantity}</span>
                <span>総保有数: {investmentSummary.totalQuantity}</span>
                <span>評価額: {formatCurrency(getCurrentValue())}</span>
                <span
                  className={`font-medium ${investmentSummary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  損益: {investmentSummary.profitLoss >= 0 ? '+' : ''}
                  {formatCurrency(investmentSummary.profitLoss)}(
                  {investmentSummary.profitLossRate >= 0 ? '+' : ''}
                  {investmentSummary.profitLossRate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* 買付・売却ボタン */}
          <div className="flex space-x-3">
            <Button
              onClick={handleBuyClick}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <HiPlus className="h-4 w-4" />
              <span>買付</span>
            </Button>
            <Button
              onClick={handleSellClick}
              variant="outline"
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
              disabled={holdingAsset.quantity <= 0}
            >
              <HiMinus className="h-4 w-4" />
              <span>売却</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 投資サマリー */}
      <Card title="投資サマリー">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">買付総額</div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(investmentSummary.totalPurchaseAmount)}
            </div>
            <div className="text-sm text-blue-500 mt-1">
              総保有数: {investmentSummary.totalQuantity}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">売却総額</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(investmentSummary.totalSellAmount)}
            </div>
            <div className="text-sm text-green-500 mt-1">
              売却数: {investmentSummary.soldQuantity}
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              investmentSummary.profitLoss >= 0 ? 'bg-teal-50' : 'bg-red-50'
            }`}
          >
            <div
              className={`text-sm font-medium ${
                investmentSummary.profitLoss >= 0 ? 'text-teal-600' : 'text-red-600'
              }`}
            >
              実現損益
            </div>
            <div
              className={`text-2xl font-bold ${
                investmentSummary.profitLoss >= 0 ? 'text-teal-700' : 'text-red-700'
              }`}
            >
              {investmentSummary.profitLoss >= 0 ? '+' : ''}
              {formatCurrency(investmentSummary.profitLoss)}
            </div>
            <div
              className={`text-sm mt-1 ${
                investmentSummary.profitLoss >= 0 ? 'text-teal-500' : 'text-red-500'
              }`}
            >
              {investmentSummary.profitLossRate >= 0 ? '+' : ''}
              {investmentSummary.profitLossRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">現在の評価額</div>
            <div className="text-2xl font-bold text-gray-700">
              {formatCurrency(getCurrentValue())}
            </div>
            <div className="text-sm text-gray-500 mt-1">現在保有数: {holdingAsset.quantity}</div>
          </div>
        </div>
      </Card>

      {/* 資産推移グラフ（取引ポイント付き） */}
      <Card>
        <HoldingAssetChart
          priceHistory={asset.priceHistory}
          transactions={transactions}
          title="資産推移"
        />
      </Card>

      {/* 取引履歴 */}
      <Card title="取引履歴">
        <div className="space-y-4">
          {/* フィルタータブ */}
          <Tabs
            tabs={[
              { id: 'all', label: '全て' },
              { id: 'buy', label: '買付' },
              { id: 'sell', label: '売却' },
              { id: 'dividend', label: '配当' },
            ]}
            activeTab={transactionFilter}
            onChange={setTransactionFilter}
          />

          {/* テーブルヘッダー */}
          <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-gray-700">
            <div>取引日</div>
            <div>資産ID</div>
            <div>資産名</div>
            <div>取引</div>
            <div>数量</div>
            <div>評価額</div>
            <div>受渡金額</div>
            <div>口座</div>
          </div>

          {/* 取引データ */}
          <div className="space-y-3">
            {getFilteredTransactions().map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-8 gap-4 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="text-gray-600">{formatDate(transaction.date)}</div>
                <div className="text-gray-600">{asset.symbol}</div>
                <div className="font-medium text-gray-900">{asset.name}</div>
                <div
                  className={`font-medium ${transaction.subType === 'buy' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {transaction.subType === 'buy' ? '買付' : '売却'}
                </div>
                <div className="text-gray-600">{transaction.quantity}</div>
                <div className="text-gray-600">{formatCurrency(transaction.price)}</div>
                <div
                  className={`font-medium ${transaction.subType === 'buy' ? 'text-red-600' : 'text-green-600'}`}
                >
                  {transaction.subType === 'buy' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-gray-600">{transaction.account}</div>
              </div>
            ))}
          </div>

          {getFilteredTransactions().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>取引履歴がありません</p>
            </div>
          )}
        </div>
      </Card>

      {/* 投資取引フォームモーダル */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        title={`${transactionSubtype === 'buy' ? '買付' : '売却'}取引`}
        size="large"
      >
        <TransactionForm
          initialType="investment"
          transaction={getPresetTransactionData()}
          selectedYear={new Date().getFullYear()}
          onSave={handleTransactionSaved}
          onCancel={handleCloseTransactionModal}
        />
      </Modal>
    </div>
  );
};

export default HoldingAssetDetail;
