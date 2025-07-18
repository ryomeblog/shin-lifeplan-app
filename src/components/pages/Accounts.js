import React, { useState, useEffect, useRef } from 'react';
import AccountsList from '../layout/AccountsList';
import AccountDetail from '../layout/AccountDetail';
import TransferForm from '../layout/TransferForm';
import AccountModal from '../forms/AccountModal';
import TutorialSpotlight from '../layout/TutorialSpotlight';
import {
  getActiveLifePlan,
  getAccounts,
  saveAccount,
  deleteAccount,
  getLifePlanSettings,
  saveLifePlanSettings,
} from '../../utils/storage';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [planSettings, setPlanSettings] = useState({
    planStartYear: 2020,
    planEndYear: 2050,
  });

  // チュートリアル用
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [settings, setSettings] = useState(getLifePlanSettings());
  const accountsListRef = useRef(null);
  const addBtnRef = useRef(null);
  const transferFormRef = useRef(null);

  // チュートリアルステップ定義
  const tutorialSteps = [
    {
      key: 'list',
      label: '口座一覧',
      desc: 'ここに登録した口座が一覧表示されます。クリックで詳細を確認できます。',
      targetRef: accountsListRef,
      panelSide: 'right',
      panelWidth: 340,
      panelHeight: 160,
    },
    {
      key: 'add',
      label: '口座追加ボタン',
      desc: 'ここから新しい口座を追加できます。',
      targetRef: addBtnRef,
      panelSide: 'bottom',
      panelWidth: 340,
      panelHeight: 160,
    },
    {
      key: 'transfer',
      label: '振替フォーム',
      desc: '口座間の資金移動（振替）をここで登録できます。',
      targetRef: transferFormRef,
      panelSide: 'left',
      panelWidth: 340,
      panelHeight: 160,
    },
  ];

  // チュートリアル終了処理
  const handleTutorialClose = () => {
    if (settings) {
      const newSettings = {
        ...settings,
        tutorialStatus: {
          ...settings.tutorialStatus,
          accounts: true,
        },
      };
      saveLifePlanSettings(newSettings);
      setSettings(newSettings);
    }
    setShowTutorial(false);
  };

  // チュートリアル表示制御
  useEffect(() => {
    if (settings && settings.tutorialStatus && settings.tutorialStatus.accounts !== true) {
      setShowTutorial(true);
      setTutorialStep(0);
    }
  }, [settings]);

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
    <TutorialSpotlight
      steps={tutorialSteps}
      step={tutorialStep}
      onNext={() => {
        if (tutorialStep < tutorialSteps.length - 1) {
          setTutorialStep((prev) => prev + 1);
        } else {
          handleTutorialClose();
        }
      }}
      onClose={handleTutorialClose}
      visible={showTutorial}
    >
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
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 口座一覧: PCは2/3幅, モバイルは全幅 */}
              <div ref={accountsListRef} className="w-full lg:w-2/3">
                <AccountsList
                  accounts={accounts}
                  onAccountClick={handleAccountClick}
                  onAddAccount={handleAddAccount}
                  formatCurrency={formatCurrency}
                  addBtnRef={addBtnRef}
                />
              </div>

              {/* 振替フォーム: PCは1/3幅, モバイルは全幅下部 */}
              <div ref={transferFormRef} className="w-full lg:w-1/3">
                <TransferForm accounts={accounts} />
              </div>
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
    </TutorialSpotlight>
  );
};

export default Accounts;
