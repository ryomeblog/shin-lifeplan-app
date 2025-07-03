import React, { useState, useEffect } from 'react';
import { HiPencilSquare, HiArrowLeft } from 'react-icons/hi2';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getCategories, getTransactions } from '../../utils/storage';

const AccountDetail = ({ account, onBack, onEdit, onDelete, planSettings, formatCurrency }) => {
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [finalBalance, setFinalBalance] = useState(0);

  // 年次データから残高履歴と取引履歴を計算
  useEffect(() => {
    const calculateData = () => {
      try {
        const categories = getCategories();

        // 残高履歴を計算
        const history = [];
        const allTransactions = [];
        let runningBalance = account.initialBalance;

        for (let year = planSettings.planStartYear; year <= planSettings.planEndYear; year++) {
          // 年次取引データを直接取得
          const yearTransactions = getTransactions(year);

          if (yearTransactions && yearTransactions.length > 0) {
            // その年の取引を処理
            yearTransactions.forEach((transaction) => {
              const amount = transaction.amount || 0;
              const frequency = transaction.frequency || 1;
              const totalAmount = amount * frequency;

              // 該当口座に関連する取引のみ処理
              let isRelevant = false;
              let balanceChange = 0;
              let transactionType = transaction.type;

              if (transaction.type === 'expense' && transaction.toAccountId === account.id) {
                // 支出：該当口座から出金
                balanceChange = -Math.abs(totalAmount);
                isRelevant = true;
              } else if (transaction.type === 'income' && transaction.toAccountId === account.id) {
                // 収入：該当口座に入金
                balanceChange = Math.abs(totalAmount);
                isRelevant = true;
              } else if (transaction.type === 'transfer') {
                if (transaction.fromAccountId === account.id) {
                  // 振替送金元：出金
                  balanceChange = -Math.abs(totalAmount);
                  isRelevant = true;
                  transactionType = 'transfer_out';
                } else if (transaction.toAccountId === account.id) {
                  // 振替送金先：入金
                  balanceChange = Math.abs(totalAmount);
                  isRelevant = true;
                  transactionType = 'transfer_in';
                }
              } else if (
                transaction.type === 'investment' &&
                transaction.toAccountId === account.id
              ) {
                // 投資取引：買付は支出（マイナス）、売却・配当は収入（プラス）として処理
                if (transaction.transactionSubtype === 'buy') {
                  // 買付：該当口座から出金（マイナス）
                  balanceChange = -Math.abs(totalAmount);
                  isRelevant = true;
                  transactionType = 'investment_buy';
                } else if (transaction.transactionSubtype === 'sell') {
                  // 売却：該当口座に入金（プラス）
                  balanceChange = Math.abs(totalAmount);
                  isRelevant = true;
                  transactionType = 'investment_sell';
                } else if (transaction.transactionSubtype === 'dividend') {
                  // 配当：該当口座に入金（プラス）
                  balanceChange = Math.abs(totalAmount);
                  isRelevant = true;
                  transactionType = 'investment_dividend';
                }
              }

              if (isRelevant) {
                runningBalance += balanceChange;

                // カテゴリ名を取得
                const category = categories.find((cat) => cat.id === transaction.categoryId);
                const categoryName = category?.name || '-';

                // 取引履歴に追加
                allTransactions.push({
                  ...transaction,
                  transactionType,
                  balanceChange,
                  balanceAfter: runningBalance,
                  categoryName,
                  year,
                });
              }
            });
          }

          history.push({
            year,
            balance: runningBalance,
            formattedBalance: formatCurrency(runningBalance),
          });
        }

        // 取引を新しい順にソート（年・月の順番で）
        allTransactions.sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year; // 年は新しい順
          }
          // 同じ年の場合は月で比較
          const aMonth = a.month || 1;
          const bMonth = b.month || 1;
          return bMonth - aMonth; // 月も新しい順
        });

        setBalanceHistory(history);
        setTransactions(allTransactions);
        setFilteredTransactions(allTransactions);
        setFinalBalance(runningBalance);
      } catch (error) {
        console.error('データ計算エラー:', error);
        // エラー時は初期残高で履歴を生成
        const history = [];
        for (let year = planSettings.planStartYear; year <= planSettings.planEndYear; year++) {
          history.push({
            year,
            balance: account.initialBalance,
            formattedBalance: formatCurrency(account.initialBalance),
          });
        }
        setBalanceHistory(history);
        setTransactions([]);
        setFilteredTransactions([]);
        setFinalBalance(account.initialBalance);
      }
    };

    calculateData();
  }, [account, planSettings, formatCurrency]);

  // タブ切り替え時のフィルタリング
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter((transaction) => {
        switch (activeTab) {
          case 'expense':
            return transaction.type === 'expense';
          case 'income':
            return transaction.type === 'income';
          case 'transfer':
            return transaction.type === 'transfer';
          case 'investment':
            return transaction.type === 'investment';
          case 'dividend':
            return (
              transaction.type === 'investment' && transaction.transactionSubtype === 'dividend'
            );
          default:
            return true;
        }
      });
      setFilteredTransactions(filtered);
    }
  }, [activeTab, transactions]);

  // 取引タイプに応じた表示名を取得
  const getTransactionTypeName = (transaction) => {
    switch (transaction.transactionType || transaction.type) {
      case 'expense':
        return '支出';
      case 'income':
        return '収入';
      case 'transfer_out':
        return '振替出金';
      case 'transfer_in':
        return '振替入金';
      case 'transfer':
        return '振替';
      case 'investment':
        return '投資';
      case 'investment_buy':
        return '投資買付';
      case 'investment_sell':
        return '投資売却';
      case 'investment_dividend':
        return '配当収入';
      default:
        return '-';
    }
  };

  // 取引金額の表示色を取得
  const getAmountColor = (balanceChange) => {
    if (balanceChange > 0) return 'text-green-600';
    if (balanceChange < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 日付フォーマット（年月のみ）
  const formatDate = (transaction) => {
    try {
      const year = transaction.year;
      const month = transaction.month || 1;
      return `${year}年${month.toString().padStart(2, '0')}月`;
    } catch {
      return '-';
    }
  };

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}年`}</p>
          <p className="text-blue-600">{`残高: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  // Y軸の金額フォーマット
  const formatYAxisLabel = (value) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  };

  // 統計情報を計算
  const minBalance =
    balanceHistory.length > 0 ? Math.min(...balanceHistory.map((h) => h.balance)) : 0;
  const maxBalance =
    balanceHistory.length > 0 ? Math.max(...balanceHistory.map((h) => h.balance)) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <HiArrowLeft className="h-4 w-4" />
            <span>戻る</span>
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{account.name}</h1>
        </div>

        <Card>
          <div className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm text-gray-600">最終残高</p>
              <p
                className={`text-2xl font-bold ${
                  finalBalance >= 0 ? 'text-gray-900' : 'text-red-600'
                }`}
              >
                {formatCurrency(finalBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                初期残高: {formatCurrency(account.initialBalance)}
              </p>
              {account.memo && <p className="text-sm text-gray-600 mt-1">{account.memo}</p>}
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => onEdit(account)} className="flex items-center space-x-1">
                <HiPencilSquare className="h-4 w-4" />
                <span>編集</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onDelete(account.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                削除
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 残高推移グラフ（Recharts） */}
      <Card title="残高推移" className="mb-6">
        <div className="p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={balanceHistory}
                margin={{
                  top: 20,
                  right: 30,
                  left: 60,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tickFormatter={formatYAxisLabel} tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />

                {/* 0円ライン */}
                {minBalance < 0 && maxBalance > 0 && (
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} />
                )}

                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    fill: '#3b82f6',
                    strokeWidth: 2,
                    stroke: '#ffffff',
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: '#3b82f6',
                    strokeWidth: 2,
                    fill: '#ffffff',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
            <div>
              期間: {planSettings.planStartYear}年 〜 {planSettings.planEndYear}年
            </div>
            {balanceHistory.length > 0 && (
              <div>
                最低残高:{' '}
                <span className={minBalance < 0 ? 'text-red-600' : 'text-gray-700'}>
                  {formatCurrency(minBalance)}
                </span>{' '}
                | 最高残高: <span className="text-blue-600">{formatCurrency(maxBalance)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 取引履歴 */}
      <Card title="取引履歴">
        <div className="p-4">
          {/* タブ */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'all', label: '全て' },
              { id: 'expense', label: '支出' },
              { id: 'income', label: '収入' },
              { id: 'transfer', label: '振替' },
              { id: 'investment', label: '投資' },
              { id: 'dividend', label: '配当' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 取引テーブル */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    内容
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    種類
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    残高
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.slice(0, 50).map((transaction, index) => (
                    <tr key={`${transaction.id}-${index}`}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.title || transaction.description || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.categoryName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTransactionTypeName(transaction)}
                      </td>
                      <td
                        className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${getAmountColor(transaction.balanceChange)}`}
                      >
                        {transaction.balanceChange > 0 ? '+' : ''}
                        {formatCurrency(transaction.balanceChange)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transaction.balanceAfter)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      {activeTab === 'all'
                        ? 'この口座に関連する取引はありません'
                        : `この口座に関連する${
                            activeTab === 'expense'
                              ? '支出'
                              : activeTab === 'income'
                                ? '収入'
                                : activeTab === 'transfer'
                                  ? '振替'
                                  : activeTab === 'investment'
                                    ? '投資'
                                    : activeTab === 'dividend'
                                      ? '配当'
                                      : ''
                          }取引はありません`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length > 50 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              最新50件を表示しています（全{filteredTransactions.length}件）
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AccountDetail;
