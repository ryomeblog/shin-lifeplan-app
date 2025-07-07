import React, { useState, useRef, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { getLifePlanSettings, getCategories, getTransactions } from '../../utils/storage';

const EventModal = ({ isOpen, onClose, onSave, event, isEditing, selectedYear }) => {
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: selectedYear || new Date().getFullYear(),
    transactionIds: [],
  });

  const [eventTransactions, setEventTransactions] = useState([]);
  const [availableTransactions, setAvailableTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedTransactionId, setSelectedTransactionId] = useState('');

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
      for (let year = currentYear; year <= currentYear + 30; year++) {
        years.push({ value: year, label: `${year}年` });
      }
      return years;
    }
  };

  const yearOptions = generateYearOptions();

  // 初期化処理
  useEffect(() => {
    if (isEditing && event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        year: event.year || selectedYear || new Date().getFullYear(),
        transactionIds: event.transactionIds || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        year: selectedYear || new Date().getFullYear(),
        transactionIds: [],
      });
    }
    setErrors({});
  }, [isEditing, event, isOpen, selectedYear]);

  // データ読み込み
  useEffect(() => {
    if (isOpen) {
      try {
        setCategories(getCategories());
      } catch (error) {
        console.error('データ読み込みエラー:', error);
      }
    }
  }, [isOpen]);

  // 年が変更されたときに取引リストを更新
  useEffect(() => {
    if (formData.year && isOpen) {
      loadTransactionsForYear(formData.year);
    }
  }, [formData.year, isOpen]);

  // 指定年の取引を読み込み
  const loadTransactionsForYear = (year) => {
    try {
      const transactions = getTransactions(year);
      setAvailableTransactions(transactions);

      // イベントに関連付けられた取引を取得
      if (isEditing && event && event.transactionIds) {
        const eventTxns = transactions.filter((t) => event.transactionIds.includes(t.id));
        setEventTransactions(eventTxns);
      }
    } catch (error) {
      console.error('取引データ読み込みエラー:', error);
      setAvailableTransactions([]);
    }
  };

  // フォームバリデーション
  const validateForm = () => {
    const newErrors = {};

    const title = titleRef.current?.value?.trim() || formData.title.trim();
    if (!title) {
      newErrors.title = 'イベント名を入力してください';
    }

    if (!formData.year) {
      newErrors.year = '年を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // refから最新値を取得
    const finalData = {
      id: event?.id || `evt_${formData.year}_${Date.now()}`,
      title: titleRef.current?.value?.trim() || formData.title,
      description: descriptionRef.current?.value?.trim() || formData.description,
      year: formData.year,
      transactionIds: formData.transactionIds,
      createdAt: event?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(finalData);
  };

  // 取引を追加
  const addTransaction = () => {
    if (!selectedTransactionId) return;

    const transaction = availableTransactions.find((t) => t.id === selectedTransactionId);
    if (transaction && !formData.transactionIds.includes(selectedTransactionId)) {
      setFormData((prev) => ({
        ...prev,
        transactionIds: [...prev.transactionIds, selectedTransactionId],
      }));
      setEventTransactions((prev) => [...prev, transaction]);
      setSelectedTransactionId(''); // 選択をリセット
    }
  };

  // 取引を削除
  const removeTransaction = (transactionId) => {
    setFormData((prev) => ({
      ...prev,
      transactionIds: prev.transactionIds.filter((id) => id !== transactionId),
    }));
    setEventTransactions((prev) => prev.filter((t) => t.id !== transactionId));
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'イベント編集' : 'イベント登録'}
      size="lg"
    >
      <div className="space-y-6">
        {/* イベント名 */}
        <div>
          <Input
            ref={titleRef}
            label="イベント名"
            defaultValue={formData.title}
            placeholder="イベント名を入力"
            required
            error={!!errors.title}
            helperText={errors.title}
          />
        </div>

        {/* 年 */}
        <div>
          <Select
            label="年"
            value={formData.year}
            onChange={(e) => setFormData((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
            options={yearOptions}
            required
            error={!!errors.year}
            helperText={errors.year}
          />
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <textarea
            ref={descriptionRef}
            defaultValue={formData.description}
            placeholder="イベントの説明を入力（任意）"
            rows={3}
            className="block w-full border border-gray-300 rounded-md px-4 py-2 text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* 関連する取引 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">関連する取引</label>

          {/* 取引追加 */}
          {availableTransactions.length > 0 && (
            <div className="mb-4 flex space-x-3">
              <div className="flex-1">
                <Select
                  placeholder="取引を選択"
                  value={selectedTransactionId}
                  onChange={(e) => setSelectedTransactionId(e.target.value)}
                  options={availableTransactions
                    .filter((t) => !formData.transactionIds.includes(t.id))
                    .map((t) => ({
                      value: t.id,
                      label: `${t.title} (${getCategoryName(t.categoryId)}) - ${getAmountPrefix(t.type)}¥${formatAmount(t.amount * (t.frequency || 1))}${t.frequency > 1 ? ` (年${t.frequency}回)` : ''}`,
                    }))}
                />
              </div>
              <Button
                onClick={addTransaction}
                disabled={!selectedTransactionId}
                variant="outline"
                size="md"
              >
                追加
              </Button>
            </div>
          )}

          {/* 関連取引リスト */}
          {eventTransactions.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              {/* ヘッダー */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                  <div>内容</div>
                  <div>カテゴリ</div>
                  <div>金額</div>
                  <div></div>
                </div>
              </div>

              {/* 取引リスト */}
              <div className="divide-y">
                {eventTransactions.map((transaction) => (
                  <div key={transaction.id} className="px-4 py-3">
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="text-sm text-gray-900">{transaction.title}</div>
                      <div className="text-sm text-gray-600">
                        {getCategoryName(transaction.categoryId)}
                      </div>
                      <div className={`text-sm font-medium ${getAmountStyle(transaction.type)}`}>
                        {getAmountPrefix(transaction.type)}¥
                        {formatAmount(transaction.amount * (transaction.frequency || 1))}
                        {transaction.frequency > 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (年{transaction.frequency}回)
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => removeTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
              <p>関連する取引がありません</p>
              <p className="text-sm mt-1">
                上記のセレクトボックスから取引を選択して追加ボタンを押してください
              </p>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>{isEditing ? '更新' : '保存'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;
