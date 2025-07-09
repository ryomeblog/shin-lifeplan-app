import React, { useState, useEffect } from 'react';
import AccountsList from '../layout/AccountsList';
import AccountDetail from '../layout/AccountDetail';
import TransferForm from '../layout/TransferForm';
import AccountModal from '../forms/AccountModal';
import { getActiveLifePlan, getAccounts, saveAccount, deleteAccount } from '../../utils/storage';

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
  const loadAccounts = () => {
    try {
      const accountsData = getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('口座読み込みエラー:', error);
    }
  };

  useEffect(() => {
    loadAccounts();
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
        // 口座リストを再読み込み
        loadAccounts();

        // 編集中の口座が選択されている場合は、選択されている口座も更新
        if (selectedAccount && editingAccount && selectedAccount.id === editingAccount.id) {
          setSelectedAccount(accountData);
        }

        // モーダルを閉じる
        setIsModalOpen(false);
        setEditingAccount(null);
      } else {
        alert('口座の保存に失敗しました');
      }
    } catch (error) {
      console.error('口座保存エラー:', error);
      alert('口座の保存中にエラーが発生しました');
    }
  };

  const handleDeleteAccount = (accountId) => {
    if (window.confirm('この口座を削除しますか？関連する取引履歴も全て削除されます。')) {
      try {
        const success = deleteAccount(accountId);

        if (success) {
          // 口座リストを再読み込み
          loadAccounts();
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  return (
    <div>
      {selectedAccount ? (
        <AccountDetail
          account={selectedAccount}
          onBack={() => setSelectedAccount(null)}
          onEdit={handleEditAccount}
          onDelete={handleDeleteAccount}
          planSettings={planSettings}
          formatCurrency={formatCurrency}
        />
      ) : (
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
        </div>
      )}

      {/* モーダルを常にレンダリング */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAccount}
        account={editingAccount}
        isEditing={!!editingAccount}
      />
    </div>
  );
};

export default Accounts;
