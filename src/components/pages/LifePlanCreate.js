import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import PlanRangeSettings from '../layout/PlanRangeSettings';
import FamilySettings from '../layout/FamilySettings';
import FireSettings from '../layout/FireSettings';
import FamilyMemberModal from '../forms/FamilyMemberModal';
import { saveLifePlan, setActiveLifePlanId } from '../../utils/storage';

const LifePlanCreate = ({ initialData = null }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // フォームの状態管理
  const [formData, setFormData] = useState({
    planStartYear: initialData?.planStartYear || currentYear,
    planEndYear: initialData?.planEndYear || currentYear + 30,
    fireTargetAmount: initialData?.fireTargetAmount || '',
  });

  // 家族メンバーの状態管理
  const [familyMembers, setFamilyMembers] = useState(initialData?.familyMembers || []);

  // モーダルの状態管理
  const [modalState, setModalState] = useState({
    isOpen: false,
    editingMember: null,
    isEditing: false,
  });

  // バリデーションエラーの状態管理
  const [errors, setErrors] = useState({});

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
      const amount = parseInt(formData.fireTargetAmount.toString().replace(/[^0-9]/g, '') || '0');
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
            ? parseInt(formData.fireTargetAmount.toString().replace(/[^0-9]/g, '') || '0')
            : 0,
          isEnabled: Boolean(formData.fireTargetAmount),
        },
      },
      familyMembers: familyMembers,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // ライフプランを保存
      const saveSuccess = saveLifePlan(lifePlanData);

      if (saveSuccess) {
        // アクティブなライフプランとして設定
        setActiveLifePlanId(lifePlanData.id);

        console.log('ライフプランデータを保存:', lifePlanData);
        navigate('/dashboard');
      } else {
        throw new Error('Failed to save life plan');
      }
    } catch (error) {
      console.error('ライフプラン保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    if (window.confirm('作成をキャンセルしますか？')) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ライフプラン作成</h1>
        </div>

        <div className="space-y-6">
          {/* ライフプラン範囲設定 */}
          <PlanRangeSettings
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />

          {/* 家族構成設定 */}
          <FamilySettings
            familyMembers={familyMembers}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            errors={errors}
          />

          {/* FIRE計画設定 */}
          <FireSettings formData={formData} onInputChange={handleInputChange} errors={errors} />
        </div>

        {/* アクションボタン */}
        <div className="flex justify-center space-x-4 pt-6">
          <Button variant="outline" onClick={handleCancel} size="lg">
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            決定
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
    </div>
  );
};

export default LifePlanCreate;
