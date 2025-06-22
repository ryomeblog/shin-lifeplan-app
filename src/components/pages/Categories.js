import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencilSquare, HiTrash } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { getCategories, saveCategories } from '../../utils/storage';

const Categories = () => {
  // データ設計に合わせて単一のcategories配列で管理
  const [categories, setCategories] = useState([
    // 支出カテゴリ（デフォルト）
    {
      id: 'cat_001',
      name: '食費',
      type: 'expense',
      color: '#007bff',
      displayOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_002',
      name: '消耗品',
      type: 'expense',
      color: '#28a745',
      displayOrder: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_003',
      name: '耐久消耗品',
      type: 'expense',
      color: '#dc3545',
      displayOrder: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_004',
      name: '交際費',
      type: 'expense',
      color: '#ffc107',
      displayOrder: 4,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_005',
      name: '住居費',
      type: 'expense',
      color: '#17a2b8',
      displayOrder: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_006',
      name: '水道光熱費',
      type: 'expense',
      color: '#6f42c1',
      displayOrder: 6,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_007',
      name: '通信費',
      type: 'expense',
      color: '#e83e8c',
      displayOrder: 7,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_008',
      name: '保険',
      type: 'expense',
      color: '#fd7e14',
      displayOrder: 8,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_009',
      name: '税金',
      type: 'expense',
      color: '#20c997',
      displayOrder: 9,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_010',
      name: 'その他',
      type: 'expense',
      color: '#6c757d',
      displayOrder: 10,
      createdAt: new Date().toISOString(),
    },
    // 収入カテゴリ（デフォルト）
    {
      id: 'cat_011',
      name: '利子所得',
      type: 'income',
      color: '#007bff',
      displayOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_012',
      name: '配当所得',
      type: 'income',
      color: '#28a745',
      displayOrder: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_013',
      name: '不動産所得',
      type: 'income',
      color: '#dc3545',
      displayOrder: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_014',
      name: '事業所得',
      type: 'income',
      color: '#ffc107',
      displayOrder: 4,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_015',
      name: '給与所得',
      type: 'income',
      color: '#17a2b8',
      displayOrder: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_016',
      name: '退職所得',
      type: 'income',
      color: '#6f42c1',
      displayOrder: 6,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_017',
      name: '山林所得',
      type: 'income',
      color: '#e83e8c',
      displayOrder: 7,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_018',
      name: '譲渡所得',
      type: 'income',
      color: '#fd7e14',
      displayOrder: 8,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_019',
      name: '一時所得',
      type: 'income',
      color: '#20c997',
      displayOrder: 9,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_020',
      name: '雑所得',
      type: 'income',
      color: '#6c757d',
      displayOrder: 10,
      createdAt: new Date().toISOString(),
    },
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

  // データ設計に合わせたカテゴリデータの読み込み
  useEffect(() => {
    try {
      const savedCategories = getCategories();
      if (savedCategories.length > 0) {
        setCategories(savedCategories);
      }
    } catch (error) {
      console.error('カテゴリ読み込みエラー:', error);
    }
  }, []);

  // データ設計に合わせたカテゴリ保存
  const saveToStorage = (categoriesData) => {
    const success = saveCategories(categoriesData);
    if (!success) {
      console.error('カテゴリ保存エラー');
    }
    return success;
  };

  // 支出カテゴリをdisplayOrderでソートして取得
  const expenseCategories = categories
    .filter((cat) => cat.type === 'expense')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // 収入カテゴリをdisplayOrderでソートして取得
  const incomeCategories = categories
    .filter((cat) => cat.type === 'income')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handleAddCategory = (type) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      color: '#007bff',
      type: type,
    });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      type: category.type,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (categoryId) => {
    const updated = categories.filter((cat) => cat.id !== categoryId);
    setCategories(updated);
    saveToStorage(updated);
  };

  // IDを生成する関数（データ設計に合わせてcat_プレフィックス）
  const generateCategoryId = () => {
    const maxId = categories.reduce((max, cat) => {
      const numPart = parseInt(cat.id.replace('cat_', ''), 10);
      return numPart > max ? numPart : max;
    }, 0);
    return `cat_${String(maxId + 1).padStart(3, '0')}`;
  };

  // 表示順序を生成する関数
  const generateDisplayOrder = (type) => {
    const sameTyeCategories = categories.filter((cat) => cat.type === type);
    return sameTyeCategories.length > 0
      ? Math.max(...sameTyeCategories.map((cat) => cat.displayOrder)) + 1
      : 1;
  };

  const handleSaveCategory = () => {
    if (!formData.name.trim()) {
      alert('カテゴリ名を入力してください');
      return;
    }

    // データ設計に合わせたカテゴリデータ構造
    const categoryData = {
      id: editingCategory?.id || generateCategoryId(),
      name: formData.name,
      type: formData.type,
      color: formData.color,
      displayOrder: editingCategory?.displayOrder || generateDisplayOrder(formData.type),
      createdAt: editingCategory?.createdAt || new Date().toISOString(),
    };

    let updated;
    if (editingCategory) {
      updated = categories.map((cat) => (cat.id === editingCategory.id ? categoryData : cat));
    } else {
      updated = [...categories, categoryData];
    }

    setCategories(updated);
    saveToStorage(updated);
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const CategoryItem = ({ category, onEdit, onDelete }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }}></div>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </div>
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(category)}
          className="flex items-center space-x-1"
        >
          <HiPencilSquare className="h-4 w-4" />
          <span>編集</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(category.id)}
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
