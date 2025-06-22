import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencilSquare, HiArrowLeft } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const NewAccounts = () => {
  const [accounts, setAccounts] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    memo: '',
  });
  const [planSettings, setPlanSettings] = useState({
    planStartYear: 2020,
    planEndYear: 2050,
  });

  // ライフプラン設定を読み込み
  useEffect(() => {
    try {
      const activePlanId = localStorage.getItem('activeLifePlan');
      const lifePlans = JSON.parse(localStorage.getItem('lifePlans') || '[]');
      const plan = lifePlans.find((p) => p.id === activePlanId);
      if (plan) {
        setPlanSettings({
          planStartYear: plan.settings.planStartYear,
          planEndYear: plan.settings.planEndYear,
        });
      }
    } catch (error) {
      console.error('ライフプラン読み込みエラー:', error);
    }
  }, []);

  // ローカルストレージからアカウントを読み込み
  useEffect(() => {
    try {
      const savedAccounts = localStorage.getItem('accounts');
      if (savedAccounts) {
        setAccounts(JSON.parse(savedAccounts));
      }
    } catch (error) {
      console.error('口座読み込みエラー:', error);
    }
  }, []);

  // ローカルストレージに保存
  const saveToLocalStorage = (accountsData) => {
    try {
      localStorage.setItem('accounts', JSON.stringify(accountsData));
    } catch (error) {
      console.error('口座保存エラー:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getTotalAssets = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      balance: '',
      memo: '',
    });
    setIsModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      balance: account.balance.toString(),
      memo: account.memo || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveAccount = () => {
    if (!formData.name.trim()) {
      alert('口座名を入力してください');
      return;
    }

    const balance = parseFloat(formData.balance.replace(/,/g, '')) || 0;

    // 残高履歴を生成（新規の場合）
    const generateBalanceHistory = (initialBalance) => {
      const history = [];
      for (let year = planSettings.planStartYear; year <= planSettings.planEndYear; year++) {
        history.push({
          year,
          balance: year === new Date().getFullYear() ? initialBalance : initialBalance,
        });
      }
      return history;
    };

    const accountData = {
      id: editingAccount?.id || `acc_${Date.now()}`,
      name: formData.name,
      balance: balance,
      memo: formData.memo,
      balanceHistory: editingAccount?.balanceHistory || generateBalanceHistory(balance),
    };

    let updatedAccounts;
    if (editingAccount) {
      updatedAccounts = accounts.map((acc) => (acc.id === editingAccount.id ? accountData : acc));
    } else {
      updatedAccounts = [...accounts, accountData];
    }

    setAccounts(updatedAccounts);
    saveToLocalStorage(updatedAccounts);
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = (accountId) => {
    if (window.confirm('この口座を削除しますか？')) {
      const updatedAccounts = accounts.filter((acc) => acc.id !== accountId);
      setAccounts(updatedAccounts);
      saveToLocalStorage(updatedAccounts);
      setSelectedAccount(null);
    }
  };

  // 口座一覧表示
  if (!selectedAccount) {
    return (
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">口座一覧</h1>
          <p className="text-lg lg:text-xl text-green-600 mt-2">
            総資産: {formatCurrency(getTotalAssets())}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 口座一覧 */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {accounts.map((account) => (
                <Card
                  key={account.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAccountClick(account)}
                >
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-600">{account.memo}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          account.balance >= 0 ? 'text-gray-900' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                onClick={handleAddAccount}
                className="w-full flex items-center justify-center space-x-2 py-4"
              >
                <HiPlus className="h-5 w-5" />
                <span>口座を追加</span>
              </Button>
            </div>
          </div>

          {/* 振替登録（プレースホルダー） */}
          <div className="lg:col-span-1">
            <Card title="振替登録">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">振替元</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>口座を選択</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">振替先</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>口座を選択</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input type="text" placeholder="金額を入力" label="金額" />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">年</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>2025年</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">月</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>4月</option>
                    </select>
                  </div>
                </div>

                <Input type="text" placeholder="メモを入力..." label="メモ（任意）" />

                <Button className="w-full">振替を実行</Button>
              </div>
            </Card>
          </div>
        </div>

        {/* 口座登録モーダル */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="口座登録">
          <div className="space-y-4">
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="口座名を入力"
              label="口座名"
            />

            <Input
              type="text"
              value={formData.balance}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.-]/g, '');
                setFormData((prev) => ({ ...prev, balance: value }));
              }}
              placeholder="初期残高を入力"
              label="初期残高"
            />

            <Input
              type="text"
              value={formData.memo}
              onChange={(e) => setFormData((prev) => ({ ...prev, memo: e.target.value }))}
              placeholder="メモを入力..."
              label="メモ（任意）"
            />

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                キャンセル
              </Button>
              <Button onClick={handleSaveAccount} className="flex-1">
                保存
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // 口座詳細表示
  return (
    <AccountDetail
      account={selectedAccount}
      onBack={() => setSelectedAccount(null)}
      onEdit={handleEditAccount}
      onDelete={handleDeleteAccount}
      planSettings={planSettings}
    />
  );
};

// 口座詳細コンポーネント
const AccountDetail = ({ account, onBack, onEdit, onDelete, planSettings }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getYearsInRange = () => {
    const years = [];
    for (let year = planSettings.planStartYear; year <= planSettings.planEndYear; year++) {
      years.push(year);
    }
    return years.slice(0, 10); // 表示する年数を制限
  };

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
              <p className="text-sm text-gray-600">残高</p>
              <p
                className={`text-2xl font-bold ${
                  account.balance >= 0 ? 'text-gray-900' : 'text-red-600'
                }`}
              >
                {formatCurrency(account.balance)}
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
            {getYearsInRange().map((year) => {
              const historyItem = account.balanceHistory?.find((h) => h.year === year);
              const balance = historyItem?.balance || account.balance;
              const maxBalance = Math.max(
                ...(account.balanceHistory?.map((h) => Math.abs(h.balance)) || [account.balance])
              );
              const height = (Math.abs(balance) / maxBalance) * 200;

              return (
                <div key={year} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2">{formatCurrency(balance)}</div>
                  <div
                    className={`w-full rounded-t ${balance >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{year}</div>
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
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">2025/04/20</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">家賃支払い</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">住居費</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">支出</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">-¥80,000</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(account.balance)}
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
                    {formatCurrency(account.balance + 100000)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">2025/04/10</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">給与振込</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">給与</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">収入</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600">+¥300,000</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(account.balance + 200000)}
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

export default NewAccounts;
