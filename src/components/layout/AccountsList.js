import React from 'react';
import { HiPlus } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getTransactions, getLifePlanSettings } from '../../utils/storage';

const AccountsList = ({ accounts, onAccountClick, onAddAccount, formatCurrency }) => {
  // 各口座の現在残高を計算（現在年月まで）
  const getAccountBalance = (account) => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      let balance = account.initialBalance;

      // ライフプラン設定から年数範囲を取得
      const planSettings = getLifePlanSettings();
      const planStartYear = planSettings.planStartYear;
      const planEndYear = planSettings.planEndYear;

      for (let year = planStartYear; year <= planEndYear; year++) {
        const yearTransactions = getTransactions(year);

        if (yearTransactions && yearTransactions.length > 0) {
          yearTransactions.forEach((transaction) => {
            const amount = transaction.amount || 0;
            const frequency = transaction.frequency || 1;
            const totalAmount = amount * frequency;
            const transactionYear = transaction.year;
            const transactionMonth = transaction.month || 1;

            // 現在年月以前の取引のみ処理
            if (
              transactionYear > currentYear ||
              (transactionYear === currentYear && transactionMonth > currentMonth)
            ) {
              return; // 将来の取引はスキップ
            }

            // 該当口座に関連する取引のみ処理
            if (transaction.type === 'expense' && transaction.toAccountId === account.id) {
              // 支出：該当口座から出金
              balance -= Math.abs(totalAmount);
            } else if (transaction.type === 'income' && transaction.toAccountId === account.id) {
              // 収入：該当口座に入金
              balance += Math.abs(totalAmount);
            } else if (transaction.type === 'transfer') {
              if (transaction.fromAccountId === account.id) {
                // 振替送金元：出金
                balance -= Math.abs(totalAmount);
              } else if (transaction.toAccountId === account.id) {
                // 振替送金先：入金
                balance += Math.abs(totalAmount);
              }
            } else if (
              transaction.type === 'investment' &&
              transaction.toAccountId === account.id
            ) {
              // 投資取引：買付は支出、売却は収入として処理
              if (transaction.transactionSubtype === 'buy') {
                // 買付：該当口座から出金
                balance -= Math.abs(totalAmount);
              } else if (transaction.transactionSubtype === 'sell') {
                // 売却：該当口座に入金
                balance += Math.abs(totalAmount);
              }
            }
          });
        }
      }

      return balance;
    } catch (error) {
      console.error('口座残高の計算に失敗:', error);
      return account.initialBalance || 0;
    }
  };

  // 総資産を計算（全口座の現在残高の合計）
  const getTotalAssets = () => {
    return accounts.reduce((total, account) => {
      return total + getAccountBalance(account);
    }, 0);
  };

  return (
    <div className="lg:col-span-2">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">口座一覧</h1>
        <p className="text-lg lg:text-xl text-green-600 mt-2">
          総資産: {formatCurrency(getTotalAssets())}
        </p>
      </div>

      <div className="space-y-4">
        {accounts.length > 0 ? (
          accounts.map((account) => {
            const currentBalance = getAccountBalance(account);

            return (
              <Card
                key={account.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onAccountClick(account)}
              >
                <div className="flex justify-between items-center p-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                    {account.memo && <p className="text-sm text-gray-600">{account.memo}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      初期残高: {formatCurrency(account.initialBalance)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">現在残高</p>
                    <p
                      className={`text-xl font-bold ${
                        currentBalance >= 0 ? 'text-gray-900' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(currentBalance)}
                    </p>
                    {currentBalance !== account.initialBalance && (
                      <p
                        className={`text-sm ${
                          currentBalance > account.initialBalance
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {currentBalance > account.initialBalance ? '+' : ''}
                        {formatCurrency(currentBalance - account.initialBalance)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="text-center py-8 text-gray-500">
              <p>口座がありません</p>
              <p className="text-sm mt-2">「口座を追加」ボタンで新しい口座を作成できます</p>
            </div>
          </Card>
        )}

        <Button
          onClick={onAddAccount}
          className="w-full flex items-center justify-center space-x-2 py-4"
        >
          <HiPlus className="h-5 w-5" />
          <span>口座を追加</span>
        </Button>
      </div>
    </div>
  );
};

export default AccountsList;
