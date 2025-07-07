import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import {
  getCategories,
  getAccounts,
  getAssetInfo,
  saveTemplateTransaction,
  updateTemplateTransaction,
} from '../../utils/storage';

const TemplateTransactionForm = ({
  templateId,
  templateType,
  transaction = null,
  isEditing = false,
  onSave,
  onCancel,
}) => {
  const titleRef = useRef(null);
  const amountRef = useRef(null);
  const quantityRef = useRef(null);
  const memoRef = useRef(null);
  const inflationRateRef = useRef(null);
  const salaryIncreaseRateRef = useRef(null);

  const [formData, setFormData] = useState({
    title: transaction?.title || '',
    amount: transaction?.amount || 0,
    accountId: transaction?.toAccountId || transaction?.fromAccountId || '',
    categoryId: transaction?.categoryId || '',
    assetId: transaction?.holdingAssetId || '',
    quantity: transaction?.quantity || 0,
    frequency: transaction?.frequency || 12, // デフォルト年12回
    eventId: transaction?.eventId || '',
    memo: transaction?.memo || '',
    inflationRate: transaction?.inflationRate || 0,
    salaryIncreaseRate: transaction?.salaryIncreaseRate || 0,
    transactionSubtype: transaction?.transactionSubtype || 'buy',
  });

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [errors, setErrors] = useState({});

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

  // 頻度オプション
  const frequencyOptions = [
    { value: 1, label: '年1回' },
    { value: 2, label: '年2回' },
    { value: 3, label: '年3回' },
    { value: 4, label: '年4回' },
    { value: 6, label: '年6回' },
    { value: 12, label: '年12回' },
    { value: 24, label: '年24回' },
    { value: 52, label: '年52回' },
  ];

  // フォーム入力処理
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors = {};
    const currentTitle = titleRef.current?.value?.trim() || formData.title.trim();
    const currentAmount = amountRef.current
      ? parseFloat(amountRef.current.value) || 0
      : formData.amount;
    const currentQuantity = quantityRef.current
      ? parseFloat(quantityRef.current.value) || 0
      : formData.quantity;

    // タイトルチェック
    if (!currentTitle) {
      newErrors.title = 'タイトルを入力してください';
    }

    // 金額チェック（投資以外）
    if (templateType !== 'investment' && currentAmount <= 0) {
      newErrors.amount = '金額を入力してください';
    }

    // 口座チェック
    if (!formData.accountId) {
      newErrors.accountId = '口座を選択してください';
    }

    // カテゴリチェック
    if (!formData.categoryId) {
      newErrors.categoryId = 'カテゴリを選択してください';
    }

    // 投資の場合
    if (templateType === 'investment') {
      if (!formData.assetId) {
        newErrors.assetId = '投資先を選択してください';
      }
      if (currentQuantity <= 0) {
        newErrors.quantity = '数量を入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const finalTitle = titleRef.current?.value?.trim() || formData.title;
    const finalAmount = amountRef.current
      ? parseFloat(amountRef.current.value) || 0
      : formData.amount;
    const finalQuantity = quantityRef.current
      ? parseFloat(quantityRef.current.value) || 0
      : formData.quantity;
    const finalMemo = memoRef.current?.value || formData.memo;
    const finalInflationRate = inflationRateRef.current
      ? parseFloat(inflationRateRef.current.value) || 0
      : formData.inflationRate;
    const finalSalaryIncreaseRate = salaryIncreaseRateRef.current
      ? parseFloat(salaryIncreaseRateRef.current.value) || 0
      : formData.salaryIncreaseRate;

    const transactionData = {
      id: transaction?.id || `tmpl_txn_${Date.now()}`,
      title: finalTitle,
      amount: finalAmount,
      categoryId: formData.categoryId,
      fromAccountId:
        templateType === 'expense' || templateType === 'investment' ? formData.accountId : null,
      toAccountId:
        templateType === 'income' || templateType === 'investment' ? formData.accountId : null,
      holdingAssetId: templateType === 'investment' ? formData.assetId : null,
      quantity: templateType === 'investment' ? finalQuantity : null,
      frequency: formData.frequency,
      eventId: null, // テンプレートではイベント設定しない
      memo: finalMemo,
      inflationRate: templateType === 'expense' ? finalInflationRate : null,
      salaryIncreaseRate: templateType === 'income' ? finalSalaryIncreaseRate : null,
      transactionSubtype: templateType === 'investment' ? formData.transactionSubtype : null,
      createdAt: transaction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      let success;
      if (isEditing) {
        success = updateTemplateTransaction(templateId, transactionData);
      } else {
        success = saveTemplateTransaction(templateId, transactionData);
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

  // フィルタリングされたカテゴリ
  const filteredCategories = categories.filter((category) => {
    if (templateType === 'expense') return category.type === 'expense';
    if (templateType === 'income') return category.type === 'income';
    return false;
  });

  return (
    <div className="space-y-6">
      {/* 取引タイプ表示 */}
      <div className="text-center">
        <span
          className={`inline-block px-4 py-2 rounded-full text-white ${
            templateType === 'expense'
              ? 'bg-red-500'
              : templateType === 'income'
                ? 'bg-green-500'
                : 'bg-blue-500'
          }`}
        >
          {templateType === 'expense' ? '支出' : templateType === 'income' ? '収入' : '投資'}
          テンプレート
        </span>
      </div>

      {/* 投資の場合：買付/売却/配当選択 */}
      {templateType === 'investment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">取引種別</label>
          <div className="flex bg-gray-100 rounded-full p-1 max-w-md">
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
            <button
              onClick={() => handleInputChange('transactionSubtype', 'dividend')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors ${
                formData.transactionSubtype === 'dividend'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-600'
              }`}
            >
              配当
            </button>
          </div>
        </div>
      )}

      {/* タイトル入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          取引タイトル <span className="text-red-500">*</span>
        </label>
        <Input
          ref={titleRef}
          type="text"
          defaultValue={formData.title}
          placeholder="例：家賃支払い、給与振込"
          error={!!errors.title}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* 金額入力（投資以外） */}
      {templateType !== 'investment' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            金額 <span className="text-red-500">*</span>
          </label>
          <Input
            ref={amountRef}
            type="number"
            defaultValue={formData.amount}
            placeholder="0"
            min="0"
            step="1"
            error={!!errors.amount}
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>
      )}

      {/* カテゴリ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        {templateType === 'investment' ? (
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
            error={!!errors.assetId}
          />
        ) : (
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
        )}
        {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
        {errors.assetId && <p className="mt-1 text-sm text-red-600">{errors.assetId}</p>}
      </div>

      {/* 投資金額・数量（投資の場合） */}
      {templateType === 'investment' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投資金額 <span className="text-red-500">*</span>
            </label>
            <Input
              ref={amountRef}
              type="number"
              defaultValue={formData.amount}
              placeholder="0"
              min="0"
              step="1"
              error={!!errors.amount}
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数量 <span className="text-red-500">*</span>
            </label>
            <Input
              ref={quantityRef}
              type="number"
              defaultValue={formData.quantity}
              placeholder="0"
              min="0"
              step="1"
              error={!!errors.quantity}
            />
            <div className="mt-1 text-sm text-gray-600">株 / 口</div>
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
          </div>
        </>
      )}

      {/* インフレ率・昇給率 */}
      {templateType === 'expense' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">インフレ率</label>
          <Input
            ref={inflationRateRef}
            type="number"
            defaultValue={formData.inflationRate}
            placeholder="0"
            min="0"
            max="100"
            step="0.1"
          />
          <div className="mt-1 text-sm text-gray-600">%</div>
        </div>
      )}

      {templateType === 'income' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">昇給率</label>
          <Input
            ref={salaryIncreaseRateRef}
            type="number"
            defaultValue={formData.salaryIncreaseRate}
            placeholder="0"
            min="0"
            max="100"
            step="0.1"
          />
          <div className="mt-1 text-sm text-gray-600">%</div>
        </div>
      )}

      {/* 口座選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {templateType === 'expense'
            ? '支払口座'
            : templateType === 'income'
              ? '入金口座'
              : formData.transactionSubtype === 'buy'
                ? '投資元口座'
                : '入金先口座'}{' '}
          <span className="text-red-500">*</span>
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
          error={!!errors.accountId}
        />
        {errors.accountId && <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>}
      </div>

      {/* 頻度設定 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">頻度（年に何回）</label>
        <Select
          value={formData.frequency}
          onChange={(e) => handleInputChange('frequency', parseInt(e.target.value))}
          options={frequencyOptions}
        />
      </div>

      {/* メモ入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">メモ（任意）</label>
        <Input ref={memoRef} type="text" defaultValue={formData.memo} placeholder="メモを入力" />
      </div>

      {/* ボタン */}
      <div className="flex space-x-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          className={`flex-1 ${
            templateType === 'expense'
              ? 'bg-red-500 hover:bg-red-600'
              : templateType === 'income'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isEditing ? '更新' : '保存'}
        </Button>
      </div>
    </div>
  );
};

export default TemplateTransactionForm;
