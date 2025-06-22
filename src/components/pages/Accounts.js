import React, { useState, useEffect } from 'react';
import AccountsList from '../layout/AccountsList';
import AccountDetail from '../layout/AccountDetail';
import TransferForm from '../layout/TransferForm';
import AccountModal from '../forms/AccountModal';
import { getActiveLifePlan, getAccounts, saveAccount, saveAccounts } from '../../utils/storage';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [planSettings, setPlanSettings] = useState({
    planStartYear: 2020,
    planEndYear: 2050,
  });

  // ライフプラン設定を読み込み
  useEffect(() => {
    try {
      const plan = getActiveLifePlan();
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

  // ストレージから口座を読み込み
  useEffect(() => {
    try {
      const accountsData = getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('口座読み込みエラー:', error);
    }
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleSaveAccount = (accountData) => {
    try {
      // ストレージに保存
      const success = saveAccount(accountData);

      if (success) {
        // 状態を更新
        let updatedAccounts;
        if (editingAccount) {
          updatedAccounts = accounts.map((acc) =>
            acc.id === editingAccount.id ? accountData : acc
          );
        } else {
          updatedAccounts = [...accounts, accountData];
        }
        setAccounts(updatedAccounts);
      } else {
        alert('口座の保存に失敗しました');
      }
    } catch (error) {
      console.error('口座保存エラー:', error);
      alert('口座の保存中にエラーが発生しました');
    }
  };

  const handleDeleteAccount = (accountId) => {
    if (window.confirm('この口座を削除しますか？')) {
      try {
        const updatedAccounts = accounts.filter((acc) => acc.id !== accountId);
        const success = saveAccounts(updatedAccounts);

        if (success) {
          setAccounts(updatedAccounts);
          setSelectedAccount(null);
        } else {
          alert('口座の削除に失敗しました');
        }
      } catch (error) {
        console.error('口座削除エラー:', error);
        alert('口座の削除中にエラーが発生しました');
      }
    }
  };

  // 口座詳細表示の場合
  if (selectedAccount) {
    return (
      <AccountDetail
        account={selectedAccount}
        onBack={() => setSelectedAccount(null)}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
        planSettings={planSettings}
        formatCurrency={formatCurrency}
      />
    );
  }

  // 口座一覧表示
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AccountsList
          accounts={accounts}
          onAccountClick={handleAccountClick}
          onAddAccount={handleAddAccount}
          formatCurrency={formatCurrency}
        />

        <TransferForm accounts={accounts} />
      </div>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccount}
        account={editingAccount}
        isEditing={!!editingAccount}
      />
    </div>
  );
};

export default Accounts;
