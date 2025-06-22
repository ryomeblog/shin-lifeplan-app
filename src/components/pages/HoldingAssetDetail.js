import React, { useState } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import HoldingAssetChart from '../layout/HoldingAssetChart';

const HoldingAssetDetail = () => {
  const { holdingId } = useParams();
  console.log('Holding ID:', holdingId); // TODO: 実際のデータ取得で使用
  const navigate = useNavigate();

  // サンプルデータ（実際はpropsやcontextから取得）
  const [holdingAsset] = useState({
    id: 'ha_002',
    assetId: 'ai_002',
    quantity: 200,
    purchaseYear: 2025,
    sellYear: null,
    accountId: 'acc_002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [asset] = useState({
    id: 'ai_002',
    name: '米国株式インデックス',
    symbol: 'US001',
    description: 'S&P500連動ETF',
    currency: 'JPY',
    priceHistory: [
      { year: 2025, price: 15000 },
      { year: 2030, price: 16000 },
      { year: 2035, price: 18000 },
      { year: 2040, price: 20000 },
      { year: 2045, price: 22000 },
      { year: 2050, price: 25000 },
    ],
    dividendHistory: [
      { year: 2025, dividendPerShare: 300 },
      { year: 2030, dividendPerShare: 350 },
    ],
  });

  // 仮の取引データ
  const [transactions] = useState([
    {
      id: 'txn_001',
      date: '2025/04',
      type: 'investment',
      subType: 'buy',
      quantity: 100,
      price: 15000,
      amount: 1500000,
      account: '楽天証券',
    },
    {
      id: 'txn_002',
      date: '2025/05',
      type: 'investment',
      subType: 'sell',
      quantity: 50,
      price: 16000,
      amount: 800000,
      account: 'SBI証券',
    },
    {
      id: 'txn_003',
      date: '2025/06',
      type: 'investment',
      subType: 'buy',
      quantity: 150,
      price: 15500,
      amount: 2325000,
      account: '楽天証券',
    },
  ]);

  const [transactionFilter, setTransactionFilter] = useState('all');

  // 計算関数
  const getCurrentPrice = () => {
    const currentYear = new Date().getFullYear();
    const priceData = asset.priceHistory
      .filter((p) => p.year <= currentYear)
      .sort((a, b) => b.year - a.year)[0];
    return priceData?.price || 0;
  };

  const getPurchasePrice = () => {
    const priceData = asset.priceHistory.find((p) => p.year === holdingAsset.purchaseYear);
    return priceData?.price || getCurrentPrice();
  };

  const getCurrentValue = () => {
    return getCurrentPrice() * holdingAsset.quantity;
  };

  const getPurchaseValue = () => {
    return getPurchasePrice() * holdingAsset.quantity;
  };

  const getProfitLoss = () => {
    return getCurrentValue() - getPurchaseValue();
  };

  const getProfitLossRate = () => {
    const purchaseValue = getPurchaseValue();
    return purchaseValue > 0 ? (getProfitLoss() / purchaseValue) * 100 : 0;
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
    return dateString; // 今回は簡単な形式のまま
  };

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
              <div className="flex items-center space-x-6 text-gray-600 mt-2">
                <span>保有数: {holdingAsset.quantity}</span>
                <span>評価額: {formatCurrency(getCurrentValue())}</span>
                <span
                  className={`font-medium ${getProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  損益: {getProfitLoss() >= 0 ? '+' : ''}
                  {formatCurrency(getProfitLoss())}({getProfitLossRate() >= 0 ? '+' : ''}
                  {getProfitLossRate().toFixed(1)}%)
                </span>
              </div>
            </div>
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
    </div>
  );
};

export default HoldingAssetDetail;
