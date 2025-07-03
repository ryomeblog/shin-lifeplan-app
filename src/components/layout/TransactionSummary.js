import React from 'react';
import Card from '../ui/Card';
import { getCategories } from '../../utils/storage';

const TransactionSummary = ({ transactions, year, type }) => {
  // カテゴリデータを取得
  const categories = getCategories();

  // categoryIdからカテゴリ情報を取得する関数
  const getCategoryInfo = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return {
      name: category?.name || 'その他',
      color: category?.color || '#6c757d',
    };
  };

  // 取引タイプ別の設定
  const typeConfig = {
    expense: {
      title: '支出',
      color: 'text-red-500',
      prefix: '-',
      showChart: true,
    },
    income: {
      title: '収入',
      color: 'text-green-500',
      prefix: '+',
      showChart: true,
    },
    transfer: {
      title: '振替取引',
      color: 'text-gray-500',
      prefix: '',
      showChart: false,
    },
    investment: {
      title: '投資実績',
      color: 'text-teal-500',
      prefix: '',
      showChart: false,
    },
  };

  const config = typeConfig[type] || typeConfig.expense;

  // 投資の場合の買付・売却・配当別集計
  const investmentSummary = React.useMemo(() => {
    if (type !== 'investment') return null;

    const buyTransactions = transactions.filter((t) => t.transactionSubtype === 'buy');
    const sellTransactions = transactions.filter((t) => t.transactionSubtype === 'sell');
    const dividendTransactions = transactions.filter((t) => t.transactionSubtype === 'dividend');

    const buyTotal = buyTransactions.reduce((sum, transaction) => {
      const amount = transaction.amount || 0;
      const frequency = transaction.frequency || 1;
      return sum + Math.abs(amount * frequency);
    }, 0);

    const sellTotal = sellTransactions.reduce((sum, transaction) => {
      const amount = transaction.amount || 0;
      const frequency = transaction.frequency || 1;
      return sum + Math.abs(amount * frequency);
    }, 0);

    const dividendTotal = dividendTransactions.reduce((sum, transaction) => {
      const amount = transaction.amount || 0;
      const frequency = transaction.frequency || 1;
      return sum + Math.abs(amount * frequency);
    }, 0);

    return {
      buyTotal,
      sellTotal,
      dividendTotal,
      buyCount: buyTransactions.length,
      sellCount: sellTransactions.length,
      dividendCount: dividendTransactions.length,
      netAmount: sellTotal + dividendTotal - buyTotal, // 売却 + 配当 - 買付 = 純損益
    };
  }, [transactions, type]);

  // 年間合計金額を計算（amount × frequency）
  const totalAmount = transactions.reduce((sum, transaction) => {
    const amount = transaction.amount || 0;
    const frequency = transaction.frequency || 1;

    if (type === 'transfer' || type === 'investment') {
      return sum + Math.abs(amount * frequency);
    }
    return sum + amount * frequency;
  }, 0);

  // 月平均を計算（年間合計 ÷ 12）
  const monthlyAverage = totalAmount / 12;

  // カテゴリ別集計（支出・収入の場合）
  const categoryTotals = React.useMemo(() => {
    if (!config.showChart) return [];

    const categoryMap = {};
    transactions.forEach((transaction) => {
      const categoryInfo = getCategoryInfo(transaction.categoryId);
      const categoryName = categoryInfo.name;
      const amount = transaction.amount || 0;
      const frequency = transaction.frequency || 1;
      const yearlyAmount = Math.abs(amount * frequency);

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          color: categoryInfo.color,
          amount: 0,
        };
      }
      categoryMap[categoryName].amount += yearlyAmount;
    });

    return Object.values(categoryMap)
      .map((category) => ({
        ...category,
        percentage:
          totalAmount > 0 ? ((category.amount / Math.abs(totalAmount)) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // 上位5カテゴリ
  }, [transactions, totalAmount, config.showChart, categories]);

  // 金額をフォーマット
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // カテゴリ色を取得（実際のカテゴリ色を使用、なければデフォルト色）
  const getCategoryColor = (category, index) => {
    if (category.color) {
      return category.color;
    }

    const defaultColors = [
      '#007bff', // blue
      '#28a745', // green
      '#ffc107', // yellow
      '#dc3545', // red
      '#6f42c1', // purple
    ];
    return defaultColors[index % defaultColors.length];
  };

  return (
    <Card className="mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 総額表示 */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {year}年の{config.title}
          </h2>

          {/* 投資の場合の詳細表示 */}
          {type === 'investment' && investmentSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* 買付合計 */}
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">買付合計</div>
                <div className="text-2xl font-bold text-red-700">
                  -{formatAmount(investmentSummary.buyTotal)}
                </div>
                <div className="text-sm text-red-500 mt-1">{investmentSummary.buyCount}件</div>
              </div>

              {/* 売却合計 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">売却合計</div>
                <div className="text-2xl font-bold text-green-700">
                  +{formatAmount(investmentSummary.sellTotal)}
                </div>
                <div className="text-sm text-green-500 mt-1">{investmentSummary.sellCount}件</div>
              </div>

              {/* 配当合計 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">配当合計</div>
                <div className="text-2xl font-bold text-yellow-700">
                  +{formatAmount(investmentSummary.dividendTotal)}
                </div>
                <div className="text-sm text-yellow-500 mt-1">
                  {investmentSummary.dividendCount}件
                </div>
              </div>

              {/* 純損益 */}
              <div
                className={`p-4 rounded-lg ${
                  investmentSummary.netAmount >= 0 ? 'bg-blue-50' : 'bg-orange-50'
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    investmentSummary.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}
                >
                  純損益
                </div>
                <div
                  className={`text-2xl font-bold ${
                    investmentSummary.netAmount >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}
                >
                  {investmentSummary.netAmount >= 0 ? '+' : ''}
                  {formatAmount(investmentSummary.netAmount)}
                </div>
                <div
                  className={`text-sm mt-1 ${
                    investmentSummary.netAmount >= 0 ? 'text-blue-500' : 'text-orange-500'
                  }`}
                >
                  {investmentSummary.netAmount >= 0 ? '利益' : '損失'}
                </div>
              </div>
            </div>
          )}

          {/* 通常の合計表示（投資以外） */}
          {type !== 'investment' && (
            <div className="mb-4">
              <div className={`text-3xl font-bold ${config.color}`}>
                {config.prefix}
                {formatAmount(Math.abs(totalAmount))}
              </div>

              {type !== 'transfer' && (
                <div className="text-lg text-gray-600 mt-2">
                  月平均: {config.prefix}
                  {formatAmount(Math.abs(monthlyAverage))}
                </div>
              )}

              {type === 'transfer' && (
                <div className="text-lg text-gray-600 mt-2">
                  総取引件数: {transactions.length}件
                </div>
              )}
            </div>
          )}
        </div>

        {/* カテゴリ別チャート（支出・収入の場合） */}
        {config.showChart && categoryTotals.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ別内訳</h3>

            {/* シンプルな円グラフ風表示 */}
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg width="160" height="160" className="transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                {categoryTotals.map((category, index) => {
                  const startAngle = categoryTotals
                    .slice(0, index)
                    .reduce((sum, cat) => sum + cat.percentage * 3.6, 0);
                  const endAngle = startAngle + category.percentage * 3.6;

                  const startX = 80 + 70 * Math.cos(((startAngle - 90) * Math.PI) / 180);
                  const startY = 80 + 70 * Math.sin(((startAngle - 90) * Math.PI) / 180);
                  const endX = 80 + 70 * Math.cos(((endAngle - 90) * Math.PI) / 180);
                  const endY = 80 + 70 * Math.sin(((endAngle - 90) * Math.PI) / 180);

                  const largeArcFlag = category.percentage > 50 ? 1 : 0;

                  return (
                    <path
                      key={category.name}
                      d={`M 80 80 L ${startX} ${startY} A 70 70 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                      fill={getCategoryColor(category, index)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* 凡例 */}
            <div className="space-y-2">
              {categoryTotals.map((category, index) => (
                <div key={category.name} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: getCategoryColor(category, index) }}
                  />
                  <span className="text-gray-700">
                    {category.name} {category.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionSummary;
