import React, { useState } from 'react';
import { HiPlus, HiPencilSquare, HiTrash } from 'react-icons/hi2';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Table from '../ui/Table';
import Card from '../ui/Card';
import FamilyMemberModal from '../forms/FamilyMemberModal';

const LifePlanCreate = ({ onSave, onCancel, initialData = null }) => {
  const currentYear = new Date().getFullYear();

  // 開始年の選択肢を生成（現在年-100年から現在年+100年後まで）
  const startYearOptions = Array.from({ length: 200 + 1 }, (_, i) => ({
    value: currentYear - 100 + i,
    label: `${currentYear - 100 + i}年`,
  }));

  // 終了年の選択肢を生成（現在年-100年から現在年+100年後まで）
  const endYearOptions = Array.from({ length: 201 }, (_, i) => ({
    value: currentYear - 100 + i,
    label: `${currentYear - 100 + i}年`,
  }));

  // フォームの状態管理
  const [formData, setFormData] = useState({
    planStartYear: initialData?.planStartYear || currentYear,
    planEndYear: initialData?.planEndYear || currentYear + 30,
    fireTargetAmount: initialData?.fireTargetAmount || '',
  });

  // 家族メンバーの状態管理
  const [familyMembers, setFamilyMembers] = useState(
    initialData?.familyMembers || [
      {
        id: 'fm_001',
        name: '山田 太郎',
        birthDate: '1990-01-01',
        lifeExpectancy: 80,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'fm_002',
        name: '山田 花子',
        birthDate: '1993-05-15',
        lifeExpectancy: 85,
        createdAt: new Date().toISOString(),
      },
    ]
  );

  // モーダルの状態管理
  const [modalState, setModalState] = useState({
    isOpen: false,
    editingMember: null,
    isEditing: false,
  });

  // バリデーションエラーの状態管理
  const [errors, setErrors] = useState({});

  // 年齢計算関数
  const calculateAge = (birthDate, referenceYear = currentYear) => {
    const birth = new Date(birthDate);
    const reference = new Date(referenceYear, 0, 1);
    return reference.getFullYear() - birth.getFullYear();
  };

  // フォーム入力処理
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // 家族メンバー追加ボタン
  const handleAddMember = () => {
    setModalState({
      isOpen: true,
      editingMember: null,
      isEditing: false,
    });
  };

  // 家族メンバー編集ボタン
  const handleEditMember = (member) => {
    setModalState({
      isOpen: true,
      editingMember: member,
      isEditing: true,
    });
  };

  // 家族メンバー削除ボタン
  const handleDeleteMember = (memberId) => {
    if (window.confirm('この家族メンバーを削除しますか？')) {
      setFamilyMembers((prev) => prev.filter((member) => member.id !== memberId));
    }
  };

  // 家族メンバー保存処理
  const handleSaveMember = (memberData) => {
    if (modalState.isEditing) {
      // 編集の場合
      setFamilyMembers((prev) =>
        prev.map((member) =>
          member.id === memberData.id
            ? { ...memberData, updatedAt: new Date().toISOString() }
            : member
        )
      );
    } else {
      // 新規追加の場合
      const newMember = {
        ...memberData,
        id: `fm_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setFamilyMembers((prev) => [...prev, newMember]);
    }
  };

  // モーダル閉じる処理
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      editingMember: null,
      isEditing: false,
    });
  };

  // バリデーション
  const validateForm = () => {
    const newErrors = {};

    // 開始年・終了年の検証
    if (formData.planStartYear >= formData.planEndYear) {
      newErrors.planEndYear = '終了年は開始年より後である必要があります';
    }

    // FIRE目標金額の検証
    if (formData.fireTargetAmount) {
      const amount = parseInt(formData.fireTargetAmount.replace(/,/g, ''));
      if (isNaN(amount) || amount <= 0) {
        newErrors.fireTargetAmount = '正しい金額を入力してください';
      }
    }

    // 家族メンバーの検証
    if (familyMembers.length === 0) {
      newErrors.familyMembers = '少なくとも1人の家族メンバーを追加してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存処理
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const lifePlanData = {
      id: initialData?.id || `lp_${Date.now()}`,
      name: initialData?.name || 'ライフプラン',
      settings: {
        planStartYear: formData.planStartYear,
        planEndYear: formData.planEndYear,
        fireSettings: {
          targetAmount: formData.fireTargetAmount
            ? parseInt(formData.fireTargetAmount.replace(/,/g, ''))
            : 0,
          isEnabled: Boolean(formData.fireTargetAmount),
        },
      },
      familyMembers: familyMembers,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave?.(lifePlanData);
  };

  // テーブルの列定義
  const tableColumns = [
    {
      key: 'name',
      label: '名前',
    },
    {
      key: 'birthDate',
      label: '生年月日',
      render: (value) => new Date(value).toLocaleDateString('ja-JP'),
    },
    {
      key: 'age',
      label: '現在年齢',
      render: (_, row) => `${calculateAge(row.birthDate)}歳`,
    },
    {
      key: 'lifeExpectancy',
      label: '寿命設定',
      render: (value) => `${value}歳`,
    },
    {
      key: 'actions',
      label: '操作',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleEditMember(row)}>
            <HiPencilSquare className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteMember(row.id)}
            className="text-red-600 hover:text-red-700"
          >
            <HiTrash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ライフプラン作成</h1>
        <p className="text-gray-600 mt-2">あなたの人生設計を始めましょう</p>
      </div>

      <div className="space-y-6">
        {/* ライフプラン範囲設定 */}
        <Card title="ライフプラン範囲設定">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始年</label>
              <Select
                options={startYearOptions}
                value={formData.planStartYear}
                onChange={(value) => handleInputChange('planStartYear', parseInt(value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了年</label>
              <Select
                options={endYearOptions}
                value={formData.planEndYear}
                onChange={(value) => handleInputChange('planEndYear', parseInt(value))}
                error={errors.planEndYear}
              />
              {errors.planEndYear && (
                <p className="mt-1 text-sm text-red-600">{errors.planEndYear}</p>
              )}
            </div>
          </div>
        </Card>

        {/* 家族構成設定 */}
        <Card
          title="家族構成設定"
          actions={
            <Button onClick={handleAddMember} size="sm" className="flex items-center space-x-1">
              <HiPlus className="h-4 w-4" />
              <span>家族メンバーを追加</span>
            </Button>
          }
        >
          {familyMembers.length > 0 ? (
            <Table data={familyMembers} columns={tableColumns} />
          ) : (
            <div className="text-center py-8 text-gray-500">家族メンバーを追加してください</div>
          )}
          {errors.familyMembers && (
            <p className="mt-2 text-sm text-red-600">{errors.familyMembers}</p>
          )}
        </Card>

        {/* FIRE計画設定 */}
        <Card
          title="FIRE計画設定"
          subtitle="Financial Independence, Retire Early（経済的自立と早期退職）"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">必要資産額（円）</label>
            <Input
              type="text"
              value={formData.fireTargetAmount}
              onChange={(e) => {
                // 数値のカンマ区切り表示
                const value = e.target.value.replace(/[^0-9]/g, '');
                const formatted = value ? parseInt(value).toLocaleString() : '';
                handleInputChange('fireTargetAmount', formatted);
              }}
              placeholder="例: 50,000,000"
              error={errors.fireTargetAmount}
            />
            {errors.fireTargetAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.fireTargetAmount}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              年間支出の25倍が目安とされています（4%ルール）
            </p>
          </div>
        </Card>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button variant="outline" onClick={onCancel} size="lg">
          キャンセル
        </Button>
        <Button onClick={handleSave} size="lg">
          保存
        </Button>
      </div>

      {/* 家族メンバーモーダル */}
      <FamilyMemberModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMember}
        member={modalState.editingMember}
        isEditing={modalState.isEditing}
      />
    </div>
  );
};

export default LifePlanCreate;
