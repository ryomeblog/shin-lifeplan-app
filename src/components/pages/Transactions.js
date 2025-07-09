import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import TransactionSummary from '../layout/TransactionSummary';
import TransactionList from '../layout/TransactionList';
import TransactionForm from '../forms/TransactionForm';
import { getLifePlanSettings, getTransactions } from '../../utils/storage';

const Transactions = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('expense');
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // ライフプラン範囲に基づいた年選択肢を生成
  const generateYearOptions = () => {
    try {
      const settings = getLifePlanSettings();
      const startYear = settings.planStartYear;
      const endYear = settings.planEndYear;

      const years = [];
      for (let year = startYear; year <= endYear; year++) {
        years.push({ value: year, label: `${year}年` });
      }
      return years;
    } catch (error) {
      console.error('ライフプラン設定の取得に失敗:', error);
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear - 5; year <= currentYear + 35; year++) {
        years.push({ value: year, label: `${year}年` });
      }
      return years;
    }
  };

  // 取引データを読み込み
  const loadTransactions = () => {
    try {
      const transactionData = getTransactions(selectedYear);
      setTransactions(transactionData);
    } catch (error) {
      console.error('取引データの読み込みエラー:', error);
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedYear]);

  // タブの設定
  const tabs = [
    { id: 'expense', label: '支出', color: '#dc3545' },
    { id: 'income', label: '収入', color: '#28a745' },
    { id: 'transfer', label: '振替', color: '#6c757d' },
    { id: 'investment', label: '投資', color: '#20c997' },
  ];

  // アクティブタブに応じて取引をフィルタリング
  const filteredTransactions = transactions.filter((transaction) => transaction.type === activeTab);

  // 新規取引追加
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // 取引編集
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // 新規モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // 編集モーダルを閉じる
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  // 取引保存完了時の処理
  const handleTransactionSaved = () => {
    // 取引データを再読み込み
    loadTransactions();

    // モーダルを閉じる
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // 取引編集保存完了時の処理
  const handleTransactionEditSaved = () => {
    // 取引データを再読み込み
    loadTransactions();

    // 編集モーダルを閉じる
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  // 取引更新時の処理（編集・削除後）
  const handleTransactionUpdate = () => {
    loadTransactions();
  };

  // タブ切り替え処理
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // 年変更処理
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダーセクション */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">取引管理</h1>

            {/* 年選択 */}
            <div className="w-32">
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                options={generateYearOptions()}
              />
            </div>
          </div>

          {/* タブ切り替え */}
          <div className="flex bg-gray-100 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* 年間サマリー */}
        <TransactionSummary
          transactions={filteredTransactions}
          year={selectedYear}
          type={activeTab}
        />

        {/* 取引リスト */}
        <TransactionList
          transactions={filteredTransactions}
          type={activeTab}
          onTransactionUpdate={handleTransactionUpdate}
          onTransactionEdit={handleEditTransaction}
        />

        {/* 新規追加ボタン（完全に丸いボタン） */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleAddTransaction}
            className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* 新規取引フォームモーダル */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="新規取引" size="large">
          <TransactionForm
            initialType={activeTab}
            selectedYear={selectedYear}
            onSave={handleTransactionSaved}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* 取引編集フォームモーダル */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title="取引編集"
          size="large"
        >
          <TransactionForm
            transaction={editingTransaction}
            isEditing={true}
            selectedYear={selectedYear}
            onSave={handleTransactionEditSaved}
            onCancel={handleCloseEditModal}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Transactions;
