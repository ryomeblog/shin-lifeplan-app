import React from 'react';
import { HiPlus } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AccountsList = ({ accounts, onAccountClick, onAddAccount, formatCurrency }) => {
  const getTotalAssets = () => {
    return accounts.reduce((total, account) => total + account.initialBalance, 0);
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
          accounts.map((account) => (
            <Card
              key={account.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onAccountClick(account)}
            >
              <div className="flex justify-between items-center p-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                  {account.memo && <p className="text-sm text-gray-600">{account.memo}</p>}
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      account.initialBalance >= 0 ? 'text-gray-900' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(account.initialBalance)}
                  </p>
                </div>
              </div>
            </Card>
          ))
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
