import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import {
  getCategories,
  getAccounts,
  getAssetInfo,
  saveTransaction,
  updateTransaction,
  getLifePlanSettings,
} from '../../utils/storage';

const TransactionForm = ({
  initialType = 'expense',
  transaction = null,
  isEditing = false,
  onSave,
  onCancel,
}) => {
  const titleRef = useRef(null);
  const amountRef = useRef(null);
  const quantityRef = useRef(null);
  const memoRef = useRef(null);
  const tagInputRef = useRef(null);
  const detailMemoRef = useRef(null);

  const [formData, setFormData] = useState({
    type: transaction?.type || initialType,
    title: transaction?.title || '',
    amount: transaction?.amount || 0,
    accountId: transaction?.toAccountId || transaction?.accountId || '',
    categoryId: transaction?.categoryId || '',
    assetId: transaction?.holdingAssetId || '',
    fromAccountId: transaction?.fromAccountId || '',
    toAccountId: transaction?.toAccountId || '',
    quantity: transaction?.quantity || 0,
    frequency: transaction?.frequency || 1,
    eventId: transaction?.eventId || '',
    memo: transaction?.memo || '',
    transactionSubtype: transaction?.transactionSubtype || 'buy',
    // 詳細設定
    year: transaction?.year || new Date().getFullYear(),
    month: transaction?.month || new Date().getMonth() + 1,
    tags: transaction?.tags || [],
    detailMemo: transaction?.detailMemo || '',
  });

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [errors, setErrors] = useState({});
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // データ読み込み
  useEffect(() => {
    try {
      setAccounts(getAccounts());
      setCategories(getCategories());
      setAssets(getAssetInfo());
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  }, []);

  // 編集データの初期化
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || initialType,
        title: transaction.title || '',
        amount: transaction.amount || 0,
        accountId: transaction.toAccountId || transaction.accountId || '',
        categoryId: transaction.categoryId || '',
        assetId: transaction.holdingAssetId || '',
        fromAccountId: transaction.fromAccountId || '',
        toAccountId: transaction.toAccountId || '',
        quantity: transaction.quantity || 0,
        frequency: transaction.frequency || 1,
        eventId: transaction.eventId || '',
        memo: transaction.memo || '',
        transactionSubtype: transaction.transactionSubtype || 'buy',
        // 詳細設定
        year: transaction.year || new Date().getFullYear(),
        month: transaction.month || new Date().getMonth() + 1,
        tags: transaction.tags || [],
        detailMemo: transaction.detailMemo || '',
      });
    }
  }, [transaction, initialType]);

  // 初期取引タイプが変更された場合にフォームデータを更新
  useEffect(() => {
    if (!transaction) {
      setFormData((prev) => ({ ...prev, type: initialType }));
    }
  }, [initialType, transaction]);

  // 取引タイプ設定
  const transactionTypes = [
    { id: 'expense', label: '支出', color: 'bg-red-500' },
    { id: 'income', label: '収入', color: 'bg-green-500' },
    { id: 'transfer', label: '振替', color: 'bg-gray-500' },
    { id: 'investment', label: '投資', color: 'bg-teal-500' },
  ];

  // 頻度オプション
  const frequencyOptions = [
    { value: 1, label: '1回' },
    { value: 2, label: '2回' },
    { value: 3, label: '3回' },
    { value: 4, label: '4回' },
    { value: 6, label: '6回' },
    { value: 12, label: '12回' },
    { value: 24, label: '24回' },
    { value: 52, label: '52回' },
  ];

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
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear - 5; year <= currentYear + 35; year++) {
        years.push({ value: year, label: `${year}年` });
      }
      return years;
    }
  };

  // 月選択肢を生成
  const generateMonthOptions = () => {
    const months = [];
    for (let month = 1; month <= 12; month++) {
      months.push({ value: month, label: `${month}月` });
    }
    return months;
  };

  // フォーム入力処理
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // タイトルのブラー処理
  const handleTitleBlur = () => {
    if (titleRef.current) {
      const value = titleRef.current.value;
      setFormData((prev) => ({ ...prev, title: value }));
    }
  };

  // 金額のブラー処理
  const handleAmountBlur = () => {
    if (amountRef.current) {
      const value = parseFloat(amountRef.current.value) || 0;
      setFormData((prev) => ({ ...prev, amount: value }));
    }
  };

  // 数量のブラー処理
  const handleQuantityBlur = () => {
    if (quantityRef.current) {
      const value = parseFloat(quantityRef.current.value) || 0;
      setFormData((prev) => ({ ...prev, quantity: value }));
    }
  };

  // メモのブラー処理
  const handleMemoBlur = () => {
    if (memoRef.current) {
      const value = memoRef.current.value;
      setFormData((prev) => ({ ...prev, memo: value }));
    }
  };

  // タグ入力処理
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // タグ追加処理（EnterキーまたはカンマでEnter）
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // タグ追加処理
  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setTagInput('');
    }
  };

  // タグ削除処理
  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // 詳細メモのブラー処理
  const handleDetailMemoBlur = () => {
    if (detailMemoRef.current) {
      const value = detailMemoRef.current.value;
      setFormData((prev) => ({ ...prev, detailMemo: value }));
    }
  };

  // 選択された資産の情報を取得
  const selectedAsset = assets.find((asset) => asset.id === formData.assetId);

  // 投資金額を計算
  const calculateInvestmentAmount = () => {
    if (!selectedAsset || !formData.quantity) return 0;
    const currentPrice =
      selectedAsset.priceHistory?.[selectedAsset.priceHistory.length - 1]?.price || 0;
    return formData.quantity * currentPrice;
  };

  // バリデーション
  const validateForm = () => {
    const newErrors = {};
    const currentTitle = titleRef.current ? titleRef.current.value.trim() : formData.title.trim();
    const currentAmount = amountRef.current
      ? parseFloat(amountRef.current.value) || 0
      : formData.amount;
    const currentQuantity = quantityRef.current
      ? parseFloat(quantityRef.current.value) || 0
      : formData.quantity;

    // タイトルチェック（支出・収入の場合）
    if ((formData.type === 'expense' || formData.type === 'income') && !currentTitle) {
      newErrors.title = 'タイトルを入力してください';
    }

    // 金額チェック
    if (formData.type !== 'investment' && currentAmount <= 0) {
      newErrors.amount = '金額を入力してください';
    }

    // 口座チェック
    if (formData.type === 'expense' || formData.type === 'income') {
      if (!formData.accountId) {
        newErrors.accountId = '口座を選択してください';
      }
    }

    // 振替の場合
    if (formData.type === 'transfer') {
      if (!formData.fromAccountId) {
        newErrors.fromAccountId = '送金元口座を選択してください';
      }
      if (!formData.toAccountId) {
        newErrors.toAccountId = '送金先口座を選択してください';
      }
      if (formData.fromAccountId === formData.toAccountId) {
        newErrors.toAccountId = '送金元と送金先は異なる口座を選択してください';
      }
    }

    // 投資の場合
    if (formData.type === 'investment') {
      if (!formData.assetId) {
        newErrors.assetId = '投資先を選択してください';
      }
      if (!formData.accountId) {
        newErrors.accountId = '投資元口座を選択してください';
      }
      if (currentQuantity <= 0) {
        newErrors.quantity = '数量を入力してください';
      }
    }

    // カテゴリチェック（支出・収入の場合）
    if ((formData.type === 'expense' || formData.type === 'income') && !formData.categoryId) {
      newErrors.categoryId = 'カテゴリを選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // 最新の値を取得
    const finalTitle = titleRef.current ? titleRef.current.value.trim() : formData.title.trim();
    const finalAmount = amountRef.current
      ? parseFloat(amountRef.current.value) || 0
      : formData.amount;
    const finalQuantity = quantityRef.current
      ? parseFloat(quantityRef.current.value) || 0
      : formData.quantity;
    const finalMemo = memoRef.current ? memoRef.current.value : formData.memo;
    const finalDetailMemo = detailMemoRef.current
      ? detailMemoRef.current.value
      : formData.detailMemo;

    const transactionData = {
      id: isEditing ? transaction.id : `txn_${Date.now()}`,
      title: finalTitle,
      type: formData.type,
      year: formData.year,
      month: formData.month,
      amount: formData.type === 'investment' ? calculateInvestmentAmount() : finalAmount,
      description: finalTitle,
      categoryId: formData.categoryId,
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.accountId || formData.toAccountId,
      holdingAssetId: formData.assetId,
      quantity: finalQuantity,
      tags: formData.tags,
      templateId: transaction?.templateId || null,
      frequency: formData.frequency,
      eventId: formData.eventId,
      memo: finalMemo,
      detailMemo: finalDetailMemo,
      transactionSubtype: formData.transactionSubtype,
      createdAt: transaction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      let success;
      if (isEditing) {
        success = updateTransaction(transactionData);
      } else {
        success = saveTransaction(transactionData);
      }

      if (success) {
        onSave && onSave(transactionData);
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存中にエラーが発生しました');
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    onCancel && onCancel();
  };

  // フィルタリングされたカテゴリ
  const filteredCategories = categories.filter((category) => {
    if (formData.type === 'expense') return category.type === 'expense';
    if (formData.type === 'income') return category.type === 'income';
    return false;
  });

  return (
    <div className="space-y-6">
      {/* 取引タイプ切り替え（編集時は無効化） */}
      <div>
        <div className="flex bg-gray-100 rounded-full p-1">
          {transactionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => !isEditing && handleInputChange('type', type.id)}
              disabled={isEditing}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-full transition-colors ${
                formData.type === type.id
                  ? `${type.color} text-white`
                  : isEditing
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        {isEditing && (
          <p className="text-xs text-gray-500 mt-1">編集時は取引タイプを変更できません</p>
        )}
      </div>

      {/* タイトル入力（支出・収入の場合） */}
      {(formData.type === 'expense' || formData.type === 'income') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            取引タイトル <span className="text-red-500">*</span>
          </label>
          <Input
            ref={titleRef}
            type="text"
            defaultValue={formData.title}
            onBlur={handleTitleBlur}
            placeholder="例：家賃支払い、給与振込"
            className="text-lg py-3"
            error={errors.title}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
      )}

      {/* 投資の場合：買付/売却選択 */}
      {formData.type === 'investment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">取引種別</label>
          <div className="flex bg-gray-100 rounded-full p-1 max-w-xs">
            <button
              onClick={() => handleInputChange('transactionSubtype', 'buy')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors ${
                formData.transactionSubtype === 'buy' ? 'bg-teal-500 text-white' : 'text-gray-600'
              }`}
            >
              買付
            </button>
            <button
              onClick={() => handleInputChange('transactionSubtype', 'sell')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors ${
                formData.transactionSubtype === 'sell' ? 'bg-red-500 text-white' : 'text-gray-600'
              }`}
            >
              売却
            </button>
          </div>
        </div>
      )}

      {/* 金額入力（投資以外） */}
      {formData.type !== 'investment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
          <Input
            ref={amountRef}
            type="number"
            defaultValue={formData.amount}
            onBlur={handleAmountBlur}
            placeholder="0"
            min="0"
            step="1"
            className="text-xl py-3"
            error={errors.amount}
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>
      )}

      {/* 投資先選択（投資の場合） */}
      {formData.type === 'investment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">投資先選択</label>
          <Select
            value={formData.assetId}
            onChange={(e) => handleInputChange('assetId', e.target.value)}
            options={[
              { value: '', label: '投資先を選択' },
              ...assets.map((asset) => ({
                value: asset.id,
                label: `${asset.name} (${asset.symbol})`,
              })),
            ]}
            error={errors.assetId}
          />
          {selectedAsset && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                現在値: ¥
                {selectedAsset.priceHistory?.[
                  selectedAsset.priceHistory.length - 1
                ]?.price?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">
                年間配当: ¥
                {selectedAsset.dividendHistory?.[
                  selectedAsset.dividendHistory.length - 1
                ]?.dividendPerShare?.toLocaleString() || 0}
              </p>
            </div>
          )}
          {errors.assetId && <p className="mt-1 text-sm text-red-600">{errors.assetId}</p>}
        </div>
      )}

      {/* 口座選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.type === 'income'
            ? '入金口座'
            : formData.type === 'investment'
              ? '投資元口座'
              : '口座'}
        </label>
        <Select
          value={formData.accountId}
          onChange={(e) => handleInputChange('accountId', e.target.value)}
          options={[
            { value: '', label: '口座を選択' },
            ...accounts.map((account) => ({
              value: account.id,
              label: account.name,
            })),
          ]}
          error={errors.accountId}
        />
        {errors.accountId && <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>}
      </div>

      {/* 振替の場合：送金元・送金先口座 */}
      {formData.type === 'transfer' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">送金元口座</label>
            <Select
              value={formData.fromAccountId}
              onChange={(e) => handleInputChange('fromAccountId', e.target.value)}
              options={[
                { value: '', label: '口座を選択' },
                ...accounts.map((account) => ({
                  value: account.id,
                  label: account.name,
                })),
              ]}
              error={errors.fromAccountId}
            />
            {errors.fromAccountId && (
              <p className="mt-1 text-sm text-red-600">{errors.fromAccountId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">送金先口座</label>
            <Select
              value={formData.toAccountId}
              onChange={(e) => handleInputChange('toAccountId', e.target.value)}
              options={[
                { value: '', label: '口座を選択' },
                ...accounts.map((account) => ({
                  value: account.id,
                  label: account.name,
                })),
              ]}
              error={errors.toAccountId}
            />
            {errors.toAccountId && (
              <p className="mt-1 text-sm text-red-600">{errors.toAccountId}</p>
            )}
          </div>
        </>
      )}

      {/* カテゴリ選択（支出・収入の場合） */}
      {(formData.type === 'expense' || formData.type === 'income') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
          <div className="grid grid-cols-3 gap-3">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleInputChange('categoryId', category.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.categoryId === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: category.color }}
                />
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
              </button>
            ))}
          </div>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
        </div>
      )}

      {/* 数量入力（投資の場合） */}
      {formData.type === 'investment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
          <Input
            ref={quantityRef}
            type="number"
            defaultValue={formData.quantity}
            onBlur={handleQuantityBlur}
            placeholder="0"
            min="0"
            step="1"
            className="text-xl py-3"
            error={errors.quantity}
          />
          <div className="mt-1 text-sm text-gray-600">株 / 口</div>
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
        </div>
      )}

      {/* 投資金額計算結果（投資の場合） */}
      {formData.type === 'investment' && selectedAsset && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.transactionSubtype === 'buy' ? '投資金額' : '売却金額'}
          </label>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-teal-600">
              ¥{calculateInvestmentAmount().toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {formData.quantity || 0} × ¥
              {selectedAsset.priceHistory?.[
                selectedAsset.priceHistory.length - 1
              ]?.price?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      )}

      {/* 頻度設定（振替以外） */}
      {formData.type !== 'transfer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">頻度（年に何回）</label>
          <div className="w-48">
            <Select
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', parseInt(e.target.value))}
              options={frequencyOptions}
            />
          </div>
        </div>
      )}

      {/* イベント選択（任意） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">イベント（任意）</label>
        <Select
          value={formData.eventId}
          onChange={(e) => handleInputChange('eventId', e.target.value)}
          options={[
            { value: '', label: 'イベントを選択' },
            // TODO: イベントデータを取得して表示
          ]}
        />
      </div>

      {/* メモ入力（振替・投資の場合） */}
      {(formData.type === 'transfer' || formData.type === 'investment') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">メモ（任意）</label>
          <Input
            ref={memoRef}
            type="text"
            defaultValue={formData.memo}
            onBlur={handleMemoBlur}
            placeholder={formData.type === 'transfer' ? '振替の目的など' : '投資メモ'}
          />
        </div>
      )}

      {/* 詳細設定ボタン（支出・収入の場合） */}
      {(formData.type === 'expense' || formData.type === 'income') && (
        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span>詳細設定</span>
          </button>
        </div>
      )}

      {/* 詳細設定セクション（支出・収入の場合） */}
      {(formData.type === 'expense' || formData.type === 'income') && showAdvancedSettings && (
        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">詳細設定</h3>

          {/* 年・月選択 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年</label>
              <Select
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                options={generateYearOptions()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">月</label>
              <Select
                value={formData.month}
                onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                options={generateMonthOptions()}
              />
            </div>
          </div>

          {/* タグ入力（バッジ形式） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タグ（任意）</label>

            {/* タグバッジ表示 */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 transition-colors"
                      title="タグを削除"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* タグ入力フィールド */}
            <div className="flex gap-2">
              <Input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="タグを入力してEnterまたはカンマで追加"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="px-4"
                disabled={!tagInput.trim()}
              >
                追加
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enterキーまたはカンマで複数のタグを追加できます
            </p>
          </div>

          {/* 詳細メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">詳細メモ（任意）</label>
            <textarea
              ref={detailMemoRef}
              defaultValue={formData.detailMemo}
              onBlur={handleDetailMemoBlur}
              placeholder="取引に関する詳細なメモを入力してください..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* ボタン */}
      <div className="flex space-x-4">
        <Button variant="outline" onClick={handleCancel} className="flex-1">
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          className={`flex-1 ${
            formData.type === 'expense'
              ? 'bg-red-500 hover:bg-red-600'
              : formData.type === 'income'
                ? 'bg-green-500 hover:bg-green-600'
                : formData.type === 'transfer'
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-teal-500 hover:bg-teal-600'
          }`}
        >
          {isEditing ? '更新' : '保存'}
        </Button>
      </div>
    </div>
  );
};

export default TransactionForm;
