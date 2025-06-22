import React, { useState } from 'react';
import { HiPlus, HiTrash } from 'react-icons/hi2';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Tabs from '../ui/Tabs';

const AssetModal = ({ isOpen, onClose, onSave, editingAsset, planSettings }) => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    priceHistory: [],
  });

  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [priceJsonData, setPriceJsonData] = useState('');

  // フォームデータ初期化
  React.useEffect(() => {
    if (editingAsset) {
      setFormData({
        name: editingAsset.name,
        symbol: editingAsset.symbol,
        description: editingAsset.description || '',
        priceHistory: [...editingAsset.priceHistory],
      });
    } else {
      // 新規作成時：開始年から終了年まで全年を初期化
      const years = [];
      for (let year = planSettings.planStartYear; year <= planSettings.planEndYear; year++) {
        years.push({ year, price: 0 });
      }
      setFormData({
        name: '',
        symbol: '',
        description: '',
        priceHistory: years,
      });
    }
  }, [editingAsset, planSettings, isOpen]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.symbol.trim()) {
      alert('資産名と銘柄コードは必須です');
      return;
    }

    const assetData = {
      id: editingAsset?.id || `ai_${Date.now()}`,
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      currency: 'JPY',
      priceHistory: formData.priceHistory.filter((p) => p.price > 0),
      dividendHistory: editingAsset?.dividendHistory || [],
      createdAt: editingAsset?.createdAt || new Date().toISOString(),
    };

    onSave(assetData);
    onClose();
  };

  const handleAddYear = () => {
    const year = parseInt(newYear);

    if (!year || year < planSettings.planStartYear || year > planSettings.planEndYear) {
      alert(
        `年は${planSettings.planStartYear}から${planSettings.planEndYear}の間で入力してください`
      );
      return;
    }

    if (formData.priceHistory.some((p) => p.year === year)) {
      alert('この年は既に存在します');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      priceHistory: [...prev.priceHistory, { year, price: 0 }],
    }));

    setNewYear('');
    setIsYearModalOpen(false);
  };

  const handleRemoveYear = (index) => {
    setFormData((prev) => ({
      ...prev,
      priceHistory: prev.priceHistory.filter((_, i) => i !== index),
    }));
  };

  const handlePriceChange = (index, price) => {
    const newPriceHistory = [...formData.priceHistory];
    newPriceHistory[index] = {
      ...newPriceHistory[index],
      price: parseFloat(price) || 0,
    };
    setFormData((prev) => ({ ...prev, priceHistory: newPriceHistory }));
  };

  // JSON入力の保存
  const handleSavePriceJson = () => {
    try {
      const jsonData = JSON.parse(priceJsonData);
      if (Array.isArray(jsonData)) {
        const validData = jsonData.filter(
          (p) =>
            p.year &&
            typeof p.year === 'number' &&
            p.price !== undefined &&
            typeof p.price === 'number' &&
            p.year >= planSettings.planStartYear &&
            p.year <= planSettings.planEndYear
        );

        const updatedPriceHistory = [...formData.priceHistory, ...validData]
          .reduce((acc, current) => {
            const existing = acc.find((item) => item.year === current.year);
            if (existing) {
              existing.price = current.price;
            } else {
              acc.push(current);
            }
            return acc;
          }, [])
          .sort((a, b) => a.year - b.year);

        setFormData((prev) => ({
          ...prev,
          priceHistory: updatedPriceHistory,
        }));

        setPriceJsonData('');
        alert('年別評価額データを更新しました');
      } else {
        alert('正しいJSON配列形式で入力してください');
      }
    } catch (error) {
      alert('JSON形式が正しくありません');
    }
  };

  // Formタブのコンテンツ
  const FormTabContent = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setIsYearModalOpen(true)}>
          <HiPlus className="h-4 w-4 mr-2" />
          年を追加
        </Button>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {formData.priceHistory
          .sort((a, b) => a.year - b.year)
          .map((priceData, index) => (
            <div key={priceData.year} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="w-20">
                <span className="text-sm font-medium text-gray-700">{priceData.year}年</span>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  value={priceData.price}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  placeholder="¥"
                  min="0"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveYear(index)}
                className="text-red-600 hover:text-red-700"
              >
                <HiTrash className="h-4 w-4" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );

  // JSONタブのコンテンツ
  const JsonTabContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">JSON年別評価額データ</label>
        <textarea
          value={priceJsonData}
          onChange={(e) => setPriceJsonData(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
          placeholder={`[
  {
    "year": 2025,
    "price": 25000
  },
  {
    "year": 2030,
    "price": 28000
  }
]`}
        />
      </div>
      <Button onClick={handleSavePriceJson} variant="outline" className="w-full">
        JSONデータを適用
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingAsset ? '資産を編集' : '資産を追加'}
        size="large"
      >
        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">資産名</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="資産名を入力..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">銘柄コード</label>
              <Input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData((prev) => ({ ...prev, symbol: e.target.value }))}
                placeholder="銘柄コードを入力..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="資産の説明..."
            />
          </div>

          {/* 年別データ */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">年別評価額</h3>
            <Tabs
              tabs={[
                {
                  label: 'Form',
                  content: FormTabContent,
                },
                {
                  label: 'JSON',
                  content: JsonTabContent,
                },
              ]}
              defaultTab={0}
            />
          </div>

          {/* 注意書き */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>※ 開始年と終了年は必須入力です</p>
            <p>※ 未入力の年は前回入力値が継続するものとして扱われます</p>
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              キャンセル
            </Button>
            <Button onClick={handleSave} className="flex-1">
              保存
            </Button>
          </div>
        </div>
      </Modal>

      {/* 年追加モーダル */}
      <Modal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        title="年を追加"
        size="small"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">年</label>
            <Input
              type="number"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder={`${planSettings.planStartYear} - ${planSettings.planEndYear}`}
              min={planSettings.planStartYear}
              max={planSettings.planEndYear}
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsYearModalOpen(false)} className="flex-1">
              キャンセル
            </Button>
            <Button onClick={handleAddYear} className="flex-1">
              追加
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssetModal;
