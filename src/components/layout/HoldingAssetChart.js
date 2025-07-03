import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const HoldingAssetChart = ({ priceHistory, transactions, title = '資産推移' }) => {
  // チャート用データの準備
  const chartData = priceHistory
    .sort((a, b) => a.year - b.year)
    .map((data) => ({
      year: data.year,
      price: data.price,
      formattedPrice: new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0,
      }).format(data.price),
    }));

  // 取引ポイントの準備
  const getTransactionPoints = () => {
    return transactions.map((transaction) => {
      const year = parseInt(transaction.date.split('/')[0]);

      return {
        year,
        price: transaction.price,
        type: transaction.subType,
        quantity: transaction.quantity,
        amount: transaction.amount,
        date: transaction.date,
        formattedPrice: new Intl.NumberFormat('ja-JP', {
          style: 'currency',
          currency: 'JPY',
          minimumFractionDigits: 0,
        }).format(transaction.price),
        formattedAmount: new Intl.NumberFormat('ja-JP', {
          style: 'currency',
          currency: 'JPY',
          minimumFractionDigits: 0,
        }).format(transaction.amount),
      };
    });
  };

  const transactionPoints = getTransactionPoints();

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const transactionAtYear = transactionPoints.filter((t) => t.year === label);

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}年`}</p>
          <p className="text-blue-600">評価額: {data.formattedPrice}</p>
          {transactionAtYear.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm font-medium text-gray-700">取引:</p>
              {transactionAtYear.map((transaction, index) => (
                <div key={index} className="text-sm">
                  <span
                    className={
                      transaction.type === 'buy'
                        ? 'text-green-600'
                        : transaction.type === 'sell'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }
                  >
                    {transaction.type === 'buy'
                      ? '買付'
                      : transaction.type === 'sell'
                        ? '売却'
                        : '配当'}
                  </span>{' '}
                  数量: {transaction.quantity} 金額: {transaction.formattedAmount}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Y軸のフォーマッター
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // カスタムドット（取引ポイント）
  const CustomizedDot = (props) => {
    const { cx, cy, payload } = props;
    const transactionAtYear = transactionPoints.filter((t) => t.year === payload.year);

    if (transactionAtYear.length === 0) {
      return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" strokeWidth={2} stroke="#3b82f6" />;
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="#3b82f6" strokeWidth={2} stroke="#3b82f6" />
        {transactionAtYear.map((transaction, index) => {
          // 取引タイプに応じて色を設定
          let fillColor;
          switch (transaction.type) {
            case 'buy':
              fillColor = '#10b981'; // 緑
              break;
            case 'sell':
              fillColor = '#ef4444'; // 赤
              break;
            case 'dividend':
              fillColor = '#f59e0b'; // 黄
              break;
            default:
              fillColor = '#6b7280'; // グレー
          }

          return (
            <circle
              key={index}
              cx={cx}
              cy={cy - 8 - index * 16}
              r={6}
              fill={fillColor}
              strokeWidth={2}
              stroke="#ffffff"
            />
          );
        })}
      </g>
    );
  };

  return (
    <div className="w-full h-80 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>

        {/* 凡例 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">買付</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">売却</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">配当</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `${value}年`}
          />
          <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={<CustomizedDot />}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HoldingAssetChart;
