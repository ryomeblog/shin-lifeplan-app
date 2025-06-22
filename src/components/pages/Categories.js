import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencilSquare, HiTrash } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const Categories = () => {
  const [expenseCategories, setExpenseCategories] = useState([
    { id: 'exp_1', name: '食費', color: '#007bff' },
    { id: 'exp_2', name: '消耗品', color: '#28a745' },
    { id: 'exp_3', name: '耐久消耗品', color: '#dc3545' },
    { id: 'exp_4', name: '交際費', color: '#ffc107' },
    { id: 'exp_5', name: '住居費', color: '#17a2b8' },
    { id: 'exp_6', name: '水道光熱費', color: '#6f42c1' },
    { id: 'exp_7', name: '通信費', color: '#e83e8c' },
    { id: 'exp_8', name: '保険', color: '#fd7e14' },
    { id: 'exp_9', name: '税金', color: '#20c997' },
    { id: 'exp_10', name: 'その他', color: '#6c757d' },
  ]);

  const [incomeCategories, setIncomeCategories] = useState([
    { id: 'inc_1', name: '利子所得', color: '#007bff' },
    { id: 'inc_2', name: '配当所得', color: '#28a745' },
    { id: 'inc_3', name: '不動産所得', color: '#dc3545' },
    { id: 'inc_4', name: '事業所得', color: '#ffc107' },
    { id: 'inc_5', name: '給与所得', color: '#17a2b8' },
    { id: 'inc_6', name: '退職所得', color: '#6f42c1' },
    { id: 'inc_7', name: '山林所得', color: '#e83e8c' },
    { id: 'inc_8', name: '譲渡所得', color: '#fd7e14' },
    { id: 'inc_9', name: '一時所得', color: '#20c997' },
    { id: 'inc_10', name: '雑所得', color: '#6c757d' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#007bff',
    type: 'expense',
  });

  const predefinedColors = [
    '#007bff',
    '#28a745',
    '#dc3545',
    '#ffc107',
    '#17a2b8',
    '#6f42c1',
    '#e83e8c',
    '#fd7e14',
    '#20c997',
    '#6c757d',
  ];

  // ローカルストレージからカテゴリを読み込み
  useEffect(() => {
    try {
      const savedExpense = localStorage.getItem('expenseCategories');
      const savedIncome = localStorage.getItem('incomeCategories');

      if (savedExpense) {
        setExpenseCategories(JSON.parse(savedExpense));
      }
      if (savedIncome) {
        setIncomeCategories(JSON.parse(savedIncome));
      }
    } catch (error) {
      console.error('カテゴリ読み込みエラー:', error);
    }
  }, []);

  // ローカルストレージに保存
  const saveToLocalStorage = (expense, income) => {
    try {
      localStorage.setItem('expenseCategories', JSON.stringify(expense));
      localStorage.setItem('incomeCategories', JSON.stringify(income));
    } catch (error) {
      console.error('カテゴリ保存エラー:', error);
    }
  };

  const handleAddCategory = (type) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      color: '#007bff',
      type: type,
    });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category, type) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      type: type,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (categoryId, type) => {
    if (type === 'expense') {
      const updated = expenseCategories.filter((cat) => cat.id !== categoryId);
      setExpenseCategories(updated);
      saveToLocalStorage(updated, incomeCategories);
    } else {
      const updated = incomeCategories.filter((cat) => cat.id !== categoryId);
      setIncomeCategories(updated);
      saveToLocalStorage(expenseCategories, updated);
    }
  };

  const handleSaveCategory = () => {
    if (!formData.name.trim()) {
      alert('カテゴリ名を入力してください');
      return;
    }

    const categoryData = {
      id: editingCategory?.id || `${formData.type === 'expense' ? 'exp' : 'inc'}_${Date.now()}`,
      name: formData.name,
      color: formData.color,
    };

    if (formData.type === 'expense') {
      let updated;
      if (editingCategory) {
        updated = expenseCategories.map((cat) =>
          cat.id === editingCategory.id ? categoryData : cat
        );
      } else {
        updated = [...expenseCategories, categoryData];
      }
      setExpenseCategories(updated);
      saveToLocalStorage(updated, incomeCategories);
    } else {
      let updated;
      if (editingCategory) {
        updated = incomeCategories.map((cat) =>
          cat.id === editingCategory.id ? categoryData : cat
        );
      } else {
        updated = [...incomeCategories, categoryData];
      }
      setIncomeCategories(updated);
      saveToLocalStorage(expenseCategories, updated);
    }

    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const CategoryItem = ({ category, type, onEdit, onDelete }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }}></div>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(category, type)}
          className="flex items-center space-x-1"
        >
          <HiPencilSquare className="h-4 w-4" />
          <span>編集</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(category.id, type)}
          className="flex items-center space-x-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        >
          <HiTrash className="h-4 w-4" />
          <span>削除</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">カテゴリ一覧</h1>
        <p className="text-gray-600 mt-2">取引で使用するカテゴリを管理できます</p>
      </div>

      <div className="space-y-8">
        {/* 支出カテゴリ */}
        <Card
          title="支出カテゴリ"
          actions={
            <Button
              onClick={() => handleAddCategory('expense')}
              size="sm"
              className="flex items-center space-x-1"
            >
              <HiPlus className="h-4 w-4" />
              <span>追加</span>
            </Button>
          }
        >
          <div className="space-y-3">
            {expenseCategories.length > 0 ? (
              expenseCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  type="expense"
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>支出カテゴリがありません</p>
                <p className="text-sm mt-2">「追加」ボタンで新しいカテゴリを作成できます</p>
              </div>
            )}
          </div>
        </Card>

        {/* 収入カテゴリ */}
        <Card
          title="収入カテゴリ"
          actions={
            <Button
              onClick={() => handleAddCategory('income')}
              size="sm"
              className="flex items-center space-x-1"
            >
              <HiPlus className="h-4 w-4" />
              <span>追加</span>
            </Button>
          }
        >
          <div className="space-y-3">
            {incomeCategories.length > 0 ? (
              incomeCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  type="income"
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>収入カテゴリがありません</p>
                <p className="text-sm mt-2">「追加」ボタンで新しいカテゴリを作成できます</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* カテゴリ編集モーダル */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="カテゴリ登録">
        <div className="space-y-6">
          {/* カテゴリ種類選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ種類</label>
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setFormData((prev) => ({ ...prev, type: 'expense' }))}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                支出
              </button>
              <button
                onClick={() => setFormData((prev) => ({ ...prev, type: 'income' }))}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.type === 'income'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                収入
              </button>
            </div>
          </div>

          {/* カテゴリ名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ名</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={`カテゴリ名を入力${formData.type === 'income' ? '（例：給与収入、副業収入）' : ''}`}
            />
          </div>

          {/* 色選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリの色</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: formData.color }}
                ></div>
                <span className="text-gray-700">選択中の色</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-400 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              キャンセル
            </Button>
            <Button onClick={handleSaveCategory} className="flex-1">
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
