import React, { useState, useEffect } from 'react';
import { HiPencilSquare, HiArrowLeft } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getActiveLifePlan } from '../../utils/storage';

const AccountDetail = ({ account, onBack, onEdit, onDelete, planSettings, formatCurrency }) => {
  const [balanceHistory, setBalanceHistory] = useState([]);

  // 年次データから残高履歴を計算
  useEffect(() => {
    const calculateBalanceHistory = () => {
      try {
        const plan = getActiveLifePlan();

        if (!plan || !plan.yearlyData) {
          // データがない場合は初期残高を基に履歴を生成
          const history = [];
          for (let year = planSettings.planStartYear; year <= planSettings.planEndYear; year++) {
            history.push({
              year,
              balance: account.initialBalance,
            });
          }
          setBalanceHistory(history.slice(0, 10)); // 10年分に制限
          return;
        }

        // 年次データから残高を計算
        const history = [];
        let currentBalance = account.initialBalance;

        for (let year = planSettings.planStartYear; year <= planSettings.planEndYear; year++) {
          const yearData = plan.yearlyData.find((yd) => yd.year === year);

          if (yearData && yearData.transactions) {
            // その年の取引を適用
            yearData.transactions.forEach((transaction) => {
              if (transaction.fromAccountId === account.id) {
                currentBalance -= transaction.amount;
              } else if (transaction.toAccountId === account.id) {
                currentBalance += transaction.amount;
              }
            });
          }

          history.push({
            year,
            balance: currentBalance,
          });
        }

        setBalanceHistory(history.slice(0, 10)); // 10年分に制限
      } catch (error) {
        console.error('残高履歴計算エラー:', error);
        // エラー時は初期残高で履歴を生成
        const history = [];
        for (let year = planSettings.planStartYear; year <= planSettings.planEndYear; year++) {
          history.push({
            year,
            balance: account.initialBalance,
          });
        }
        setBalanceHistory(history.slice(0, 10));
      }
    };

    calculateBalanceHistory();
  }, [account, planSettings]);

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
              <p className="text-sm text-gray-600">初期残高</p>
              <p
                className={`text-2xl font-bold ${
                  account.initialBalance >= 0 ? 'text-gray-900' : 'text-red-600'
                }`}
              >
                {formatCurrency(account.initialBalance)}
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

      {/* 残高推移グラフ */}
      <Card title="残高推移" className="mb-6">
        <div className="p-4">
          <div className="h-64 flex items-end space-x-2 border-b border-gray-200">
            {balanceHistory.map((item) => {
              const maxBalance = Math.max(...balanceHistory.map((h) => Math.abs(h.balance)));
              const height = maxBalance > 0 ? (Math.abs(item.balance) / maxBalance) * 200 : 50;

              return (
                <div key={item.year} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2">{formatCurrency(item.balance)}</div>
                  <div
                    className={`w-full rounded-t ${
                      item.balance >= 0 ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{item.year}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 取引履歴 */}
      <Card title="取引履歴">
        <div className="p-4">
          {/* タブ */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
              全て
            </button>
            <button className="flex-1 px-4 py-2 text-gray-600 rounded-md text-sm font-medium hover:bg-white">
              支出
            </button>
            <button className="flex-1 px-4 py-2 text-gray-600 rounded-md text-sm font-medium hover:bg-white">
              収入
            </button>
            <button className="flex-1 px-4 py-2 text-gray-600 rounded-md text-sm font-medium hover:bg-white">
              振替
            </button>
            <button className="flex-1 px-4 py-2 text-gray-600 rounded-md text-sm font-medium hover:bg-white">
              投資
            </button>
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
                {/* サンプルデータ - 実際のデータに置き換える */}
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">2025/04/20</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">家賃支払い</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">住居費</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">支出</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">-¥80,000</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(account.initialBalance - 80000)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">2025/04/15</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    振替（メイン→貯金）
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">振替</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-yellow-600">¥100,000</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(account.initialBalance + 20000)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">2025/04/10</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">給与振込</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">給与</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">収入</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600">+¥300,000</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(account.initialBalance + 200000)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccountDetail;
