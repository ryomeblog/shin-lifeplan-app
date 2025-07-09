import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import EventModal from '../forms/EventModal';
import {
  getEvents,
  saveEvent,
  updateEvent,
  deleteEvent,
  getTransactions,
  getCategories,
  getLifePlanSettings,
} from '../../utils/storage';

const Events = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  // 年選択肢を生成
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
      // フォールバック処理
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear - 5; year <= currentYear + 30; year++) {
        years.push({ value: year, label: `${year}年` });
      }
      return years;
    }
  };

  const yearOptions = generateYearOptions();

  // データ読み込み
  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = () => {
    try {
      setEvents(getEvents(selectedYear));
      setTransactions(getTransactions(selectedYear));
      setCategories(getCategories());
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  };

  // イベント保存
  const handleSaveEvent = (eventData) => {
    try {
      if (editingEvent) {
        const success = updateEvent(eventData);
        if (success) {
          loadData();
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }
      } else {
        const success = saveEvent(eventData);
        if (success) {
          loadData();
          setIsEventModalOpen(false);
        }
      }
    } catch (error) {
      console.error('イベント保存エラー:', error);
    }
  };

  // イベント削除
  const handleDeleteEvent = () => {
    if (!deletingEvent) return;

    try {
      const success = deleteEvent(deletingEvent.id, deletingEvent.year);
      if (success) {
        loadData();
        setIsDeleteModalOpen(false);
        setDeletingEvent(null);
      }
    } catch (error) {
      console.error('イベント削除エラー:', error);
    }
  };

  // 新規イベント作成
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  // イベント編集
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  // イベント削除確認
  const handleConfirmDelete = (event) => {
    setDeletingEvent(event);
    setIsDeleteModalOpen(true);
  };

  // カテゴリ名を取得
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : '不明なカテゴリ';
  };

  // 金額の表示スタイルを取得
  const getAmountStyle = (type) => {
    switch (type) {
      case 'expense':
        return 'text-red-600';
      case 'income':
        return 'text-green-600';
      case 'investment':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // 金額のプレフィックスを取得
  const getAmountPrefix = (type) => {
    switch (type) {
      case 'expense':
        return '-';
      case 'income':
        return '+';
      default:
        return '';
    }
  };

  // 金額をフォーマット
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  // イベントの収支を計算
  const calculateEventSummary = (event) => {
    const eventTransactions = transactions.filter((t) => event.transactionIds.includes(t.id));

    const income = eventTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount * (t.frequency || 1), 0);

    const expense = eventTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount * (t.frequency || 1), 0);

    const balance = income - expense;

    return { income, expense, balance, transactions: eventTransactions };
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">イベント一覧</h1>
        <Button onClick={handleCreateEvent} className="flex items-center space-x-2">
          <FiPlus className="w-4 h-4" />
          <span>新規イベント</span>
        </Button>
      </div>

      {/* 年選択 */}
      <div className="mb-6">
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          options={yearOptions}
          className="w-48"
        />
      </div>

      {/* イベントリスト */}
      <div className="space-y-6">
        {events.length > 0 ? (
          events.map((event) => {
            const summary = calculateEventSummary(event);

            return (
              <Card key={event.id} className="overflow-hidden">
                <div className="p-6">
                  {/* イベントヘッダー */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                      {event.description && <p className="text-gray-600">{event.description}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                        className="flex items-center space-x-1"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>編集</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmDelete(event)}
                        className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>削除</span>
                      </Button>
                    </div>
                  </div>

                  {/* 収支サマリー */}
                  {summary.transactions.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">収入合計</span>
                          <div className="text-lg font-bold text-green-600">
                            ¥{formatAmount(summary.income)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">支出合計</span>
                          <div className="text-lg font-bold text-red-600">
                            -¥{formatAmount(summary.expense)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">収支</span>
                          <div
                            className={`text-lg font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {summary.balance >= 0 ? '+' : '-'}¥
                            {formatAmount(Math.abs(summary.balance))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 関連取引リスト */}
                  {summary.transactions.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      {/* ヘッダー */}
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                          <div>取引内容</div>
                          <div>カテゴリ</div>
                          <div>金額</div>
                        </div>
                      </div>

                      {/* 取引リスト */}
                      <div className="divide-y">
                        {summary.transactions.map((transaction) => (
                          <div key={transaction.id} className="px-4 py-3">
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="text-sm text-gray-900">{transaction.title}</div>
                              <div className="text-sm text-gray-600">
                                {getCategoryName(transaction.categoryId)}
                              </div>
                              <div
                                className={`text-sm font-medium ${getAmountStyle(transaction.type)}`}
                              >
                                {getAmountPrefix(transaction.type)}¥
                                {formatAmount(transaction.amount * (transaction.frequency || 1))}
                                {transaction.frequency > 1 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (年{transaction.frequency}回)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                      <p>関連する取引がありません</p>
                      <p className="text-sm mt-1">編集から取引を関連付けることができます</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <h3 className="text-lg font-medium mb-2">イベントがありません</h3>
              <p className="text-sm mb-4">{selectedYear}年のライフイベントがありません</p>
              <Button onClick={handleCreateEvent} className="flex items-center space-x-2 mx-auto">
                <FiPlus className="w-4 h-4" />
                <span>新規イベントを作成</span>
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* イベントモーダル */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        event={editingEvent}
        isEditing={!!editingEvent}
        selectedYear={selectedYear}
      />

      {/* 削除確認モーダル */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEvent(null);
        }}
        title="イベント削除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">「{deletingEvent?.title}」を削除しますか？</p>
          <p className="text-sm text-gray-500">
            この操作は取り消すことができません。関連する取引は削除されませんが、イベントとの関連付けは解除されます。
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingEvent(null);
              }}
            >
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleDeleteEvent}>
              削除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Events;
