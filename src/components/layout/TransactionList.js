import React, { useState } from 'react';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import TransactionForm from '../forms/TransactionForm';
import {
  getCategories,
  updateTransaction,
  deleteTransaction,
  getAccounts,
  getAssetInfo,
} from '../../utils/storage';

const TransactionList = ({ transactions, type, onTransactionUpdate, onTransactionEdit }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // カテゴリデータを取得
  const categories = getCategories();

  // 口座データを取得
  const accounts = getAccounts();

  // 資産データを取得
  const assets = getAssetInfo();

  // accountId から口座名を取得する関数
  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : '不明な口座';
  };

  // assetId から資産名を取得する関数
  const getAssetName = (assetId) => {
    const asset = assets.find((ast) => ast.id === assetId);
    console.log('assets', assets);
    console.log('assetId', assetId);
    return asset ? asset.name : '不明な銘柄';
  };

  // 取引タイプに応じた金額の色とプレフィックスを取得
  const getAmountStyle = (amount, transactionType, transactionSubtype) => {
    if (transactionType === 'transfer') {
      return {
        color: 'text-gray-600',
        prefix: '',
      };
    }
    if (transactionType === 'investment') {
      if (transactionSubtype === 'buy') {
        return {
          color: 'text-red-600',
          prefix: '-',
        };
      } else if (transactionSubtype === 'sell') {
        return {
          color: 'text-green-600',
          prefix: '+',
        };
      }
      return {
        color: 'text-teal-600',
        prefix: '',
      };
    }
    if (transactionType === 'expense') {
      return {
        color: 'text-red-600',
        prefix: '-',
      };
    }
    if (transactionType === 'income') {
      return {
        color: 'text-green-600',
        prefix: '+',
      };
    }
    // デフォルト
    return {
      color: 'text-gray-600',
      prefix: '',
    };
  };

  // 取引編集処理
  const handleEditTransaction = (transaction) => {
    // 親コンポーネントから onTransactionEdit が渡されている場合はそれを使用
    if (onTransactionEdit) {
      onTransactionEdit(transaction);
    } else {
      // フォールバック：独自のモーダルを使用
      setEditingTransaction(transaction);
      setIsEditModalOpen(true);
    }
  };

  // 取引削除処理
  const handleDeleteTransaction = (transaction) => {
    if (
      window.confirm(
        `「${transaction.title || transaction.description || '取引'}」を削除しますか？`
      )
    ) {
      try {
        const success = deleteTransaction(transaction.id, transaction.year);
        if (success) {
          onTransactionUpdate && onTransactionUpdate();
        } else {
          alert('削除に失敗しました');
        }
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除中にエラーが発生しました');
      }
    }
  };

  // 取引更新処理
  const handleUpdateTransaction = (updatedTransaction) => {
    try {
      const success = updateTransaction(updatedTransaction);
      if (success) {
        setIsEditModalOpen(false);
        setEditingTransaction(null);
        onTransactionUpdate && onTransactionUpdate();
      } else {
        alert('更新に失敗しました');
      }
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新中にエラーが発生しました');
    }
  };

  // 編集モーダルを閉じる
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  // 取引をカテゴリ別にグループ化（全カテゴリを基準とする）
  const groupedTransactions = React.useMemo(() => {
    if (type === 'transfer' || type === 'investment') {
      // 振替・投資の場合はフラットなリストで表示
      return transactions.map((transaction) => ({
        ...transaction,
        isFlat: true,
      }));
    }

    // 該当タイプのカテゴリをすべて取得
    const filteredCategories = categories.filter((category) => category.type === type);

    // カテゴリ別に取引をグループ化
    const groups = {};

    // まず全カテゴリを初期化（取引がないカテゴリも含む）
    filteredCategories.forEach((category) => {
      groups[category.id] = {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        total: 0,
        transactions: [],
      };
    });

    // 取引をカテゴリ別に振り分け
    transactions.forEach((transaction) => {
      const categoryId = transaction.categoryId;
      const amount = transaction.amount || 0;
      const frequency = transaction.frequency || 1;
      const yearlyAmount = Math.abs(amount * frequency);

      if (groups[categoryId]) {
        groups[categoryId].total += yearlyAmount;
        groups[categoryId].transactions.push(transaction);
      } else {
        // カテゴリが見つからない場合は「その他」として扱う
        if (!groups['other']) {
          groups['other'] = {
            categoryId: 'other',
            categoryName: 'その他',
            categoryColor: '#6c757d',
            total: 0,
            transactions: [],
          };
        }
        groups['other'].total += yearlyAmount;
        groups['other'].transactions.push(transaction);
      }
    });

    // 各カテゴリ内の取引を金額の高い順にソート（年間合計で比較）
    Object.values(groups).forEach((group) => {
      group.transactions.sort((a, b) => {
        const aYearly = Math.abs((a.amount || 0) * (a.frequency || 1));
        const bYearly = Math.abs((b.amount || 0) * (b.frequency || 1));
        return bYearly - aYearly;
      });
    });

    // カテゴリを金額の高い順にソート
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [transactions, type, categories]);

  // カテゴリの展開/縮小を切り替え
  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // 金額をフォーマット
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 頻度の表示文字列を生成（年何回形式で統一）
  const getFrequencyText = (frequency) => {
    return `年${frequency}回`;
  };

  if (type === 'transfer' || type === 'investment') {
    // 振替・投資の場合のフラット表示
    return (
      <div className="space-y-4">
        {groupedTransactions.map((transaction, index) => (
          <Card key={`${transaction.id || index}`} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full mr-3"
                  style={{ backgroundColor: transaction.categoryColor || '#6c757d' }}
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {type === 'transfer'
                      ? `${getAccountName(transaction.fromAccountId)} → ${getAccountName(transaction.toAccountId)}`
                      : transaction.title ||
                        `${transaction.transactionSubtype === 'buy' ? '【買付】' : '【売却】'}${getAssetName(transaction.holdingAssetId)}`}
                  </div>
                  {type === 'investment' && (
                    <div className="text-sm text-gray-600">
                      {transaction.transactionSubtype === 'buy' ? '買付' : '売却'}数量:{' '}
                      {transaction.quantity || 0}株
                      {transaction.transactionSubtype && (
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs ${transaction.transactionSubtype === 'buy' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                        >
                          {transaction.transactionSubtype === 'buy' ? '買付' : '売却'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`text-lg font-semibold ${getAmountStyle(transaction.amount, type, transaction.transactionSubtype).color}`}
                >
                  {getAmountStyle(transaction.amount, type, transaction.transactionSubtype).prefix}
                  {formatAmount(Math.abs(transaction.amount || 0))}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditTransaction(transaction)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="編集"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="削除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {groupedTransactions.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              {type === 'transfer' && '振替取引がありません'}
              {type === 'investment' && '投資取引がありません'}
            </div>
          </Card>
        )}

        {/* 独自の編集モーダル（onTransactionEditが渡されていない場合のフォールバック） */}
        {!onTransactionEdit && editingTransaction && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            title="取引編集"
            size="large"
          >
            <TransactionForm
              initialType={editingTransaction.type}
              transaction={editingTransaction}
              isEditing={true}
              onSave={handleUpdateTransaction}
              onCancel={handleCloseEditModal}
            />
          </Modal>
        )}
      </div>
    );
  }

  // 支出・収入の場合のカテゴリ別表示
  return (
    <div className="space-y-4">
      {groupedTransactions.map((category) => (
        <Card key={category.categoryId} className="overflow-hidden">
          {/* カテゴリヘッダー */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleCategory(category.categoryName)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full mr-3"
                  style={{ backgroundColor: category.categoryColor }}
                />
                <div>
                  <div className="font-semibold text-gray-900">{category.categoryName}</div>
                  <div className="text-sm text-gray-600">
                    月平均: {getAmountStyle(category.total, type).prefix}
                    {formatAmount(category.total / 12)}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className={`text-lg font-semibold mr-4 ${getAmountStyle(category.total, type).color}`}
                >
                  {getAmountStyle(category.total, type).prefix}
                  {formatAmount(category.total)}
                </div>
                <div
                  className={`transform transition-transform ${
                    expandedCategories[category.categoryName] ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* 取引詳細リスト */}
          {expandedCategories[category.categoryName] && (
            <div className="bg-gray-50 border-t">
              {category.transactions.length > 0 ? (
                category.transactions.map((transaction, index) => {
                  const amount = transaction.amount || 0;
                  const frequency = transaction.frequency || 1;
                  const yearlyAmount = Math.abs(amount * frequency);

                  return (
                    <div
                      key={`${transaction.id || index}`}
                      className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {transaction.title || transaction.description || '取引'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {getFrequencyText(frequency)}
                            {` (${getAmountStyle(amount, type).prefix}${formatAmount(Math.abs(amount))}/回)`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`text-lg font-semibold ${getAmountStyle(amount, type).color}`}
                          >
                            {getAmountStyle(amount, type).prefix}
                            {formatAmount(yearlyAmount)}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="編集"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="削除"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-center text-gray-500">
                  このカテゴリには取引がありません
                </div>
              )}
            </div>
          )}
        </Card>
      ))}

      {groupedTransactions.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            {type === 'expense' && '支出カテゴリがありません'}
            {type === 'income' && '収入カテゴリがありません'}
          </div>
        </Card>
      )}

      {/* 独自の編集モーダル（onTransactionEditが渡されていない場合のフォールバック） */}
      {!onTransactionEdit && editingTransaction && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title="取引編集"
          size="large"
        >
          <TransactionForm
            initialType={editingTransaction.type}
            transaction={editingTransaction}
            isEditing={true}
            onSave={handleUpdateTransaction}
            onCancel={handleCloseEditModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default TransactionList;
