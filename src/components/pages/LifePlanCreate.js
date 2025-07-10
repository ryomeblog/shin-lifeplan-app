import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import PlanRangeSettings from '../layout/PlanRangeSettings';
import FamilySettings from '../layout/FamilySettings';
import FireSettings from '../layout/FireSettings';
import FamilyMemberModal from '../forms/FamilyMemberModal';
import { saveLifePlan, setActiveLifePlanId, getLifePlans } from '../../utils/storage';

const LifePlanCreate = ({ initialData = null }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // ライフプラン名入力用のref（uncontrolled component）
  const planNameRef = useRef(null);

  // フォームの状態管理
  const [formData, setFormData] = useState({
    planName: initialData?.name || '',
    planStartYear: initialData?.settings?.planStartYear || currentYear,
    planEndYear: initialData?.settings?.planEndYear || currentYear + 30,
    fireTargetAmount: initialData?.settings?.fireSettings?.targetAmount || '',
  });

  // 家族メンバーの状態管理
  const [familyMembers, setFamilyMembers] = useState(initialData?.familyMembers || []);

  // モーダルの状態管理
  const [modalState, setModalState] = useState({
    isOpen: false,
    editingMember: null,
    isEditing: false,
  });

  // データ確認モーダルの状態管理
  const [dataConfirmModal, setDataConfirmModal] = useState({
    isOpen: false,
    existingPlans: [],
  });

  // バリデーションエラーの状態管理
  const [errors, setErrors] = useState({});

  // 初期化時にローカルデータの存在をチェック
  useEffect(() => {
    const existingPlans = getLifePlans();
    if (existingPlans.length > 0) {
      setDataConfirmModal({
        isOpen: true,
        existingPlans: existingPlans,
      });
    }
  }, []);

  // フォーム入力処理（年や金額など、即座に反映したいもの用）
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

  // ライフプラン名のブラー処理（フォーカスが離れた時に実際のフォームデータを更新）
  const handlePlanNameBlur = () => {
    if (planNameRef.current) {
      const value = planNameRef.current.value;
      setFormData((prev) => ({
        ...prev,
        planName: value,
      }));

      // エラーをクリア
      if (errors.planName) {
        setErrors((prev) => ({
          ...prev,
          planName: '',
        }));
      }
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

  // 過去データを使用する
  const handleUsePastData = () => {
    setDataConfirmModal({ isOpen: false, existingPlans: [] });
    navigate('/shin-lifeplan-app/dashboard');
  };

  // 過去データを使用しない（新規作成を続行）
  const handleNotUsePastData = () => {
    setDataConfirmModal({ isOpen: false, existingPlans: [] });
  };

  // 過去データを破棄する
  const handleDiscardPastData = () => {
    if (window.confirm('すべての過去データを完全に削除しますか？\nこの操作は元に戻せません。')) {
      // ローカルストレージを完全にクリア
      localStorage.removeItem('lifePlanData');
      localStorage.removeItem('activeLifePlan');

      setDataConfirmModal({ isOpen: false, existingPlans: [] });
      alert('過去データを削除しました');
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors = {};

    // ライフプラン名の検証（refから現在の値を取得）
    const currentPlanName = planNameRef.current?.value || formData.planName;
    if (!currentPlanName.trim()) {
      newErrors.planName = 'ライフプラン名を入力してください';
    }

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
    // 保存前にrefから最新のプラン名を取得してフォームデータに反映
    if (planNameRef.current) {
      const currentPlanName = planNameRef.current.value;
      setFormData((prev) => ({
        ...prev,
        planName: currentPlanName,
      }));
    }

    if (!validateForm()) {
      return;
    }

    // 最新のプラン名を取得（refから直接取得）
    const finalPlanName = planNameRef.current?.value?.trim() || formData.planName.trim();

    // デフォルトカテゴリの定義
    const defaultCategories = [
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
    ];

    const lifePlanData = {
      id: initialData?.id || `lp_${Date.now()}`,
      name: finalPlanName,
      settings: {
        currency: 'JPY',
        planStartYear: formData.planStartYear,
        planEndYear: formData.planEndYear,
        fireSettings: {
          targetAmount: formData.fireTargetAmount
            ? parseInt(formData.fireTargetAmount.toString().replace(/[^0-9]/g, '') || '0')
            : 0,
          isEnabled: Boolean(formData.fireTargetAmount),
        },
        displaySettings: {
          dateFormat: 'YYYY-MM-DD',
          numberFormat: 'comma',
        },
      },
      familyMembers: familyMembers,
      accounts: initialData?.accounts || [],
      categories: initialData?.categories || defaultCategories,
      assetInfo: initialData?.assetInfo || [],
      templates: initialData?.templates || [],
      yearlyData: initialData?.yearlyData || [],
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
        navigate('/shin-lifeplan-app/dashboard');
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
      navigate('/shin-lifeplan-app/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ライフプラン作成</h1>
        </div>

        <div className="space-y-6">
          {/* ライフプラン名設定 */}
          <Card title="ライフプラン名">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ライフプラン名 <span className="text-red-500">*</span>
                </label>
                <Input
                  ref={planNameRef}
                  type="text"
                  defaultValue={formData.planName}
                  onBlur={handlePlanNameBlur}
                  placeholder="例：独身ライフプラン、夫婦ライフプラン"
                  error={errors.planName}
                />
                {errors.planName && <p className="mt-1 text-sm text-red-600">{errors.planName}</p>}
              </div>
            </div>
          </Card>

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

        {/* データ確認モーダル */}
        <Modal
          isOpen={dataConfirmModal.isOpen}
          onClose={() => {}}
          title="過去データが見つかりました"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              既存のライフプランデータが見つかりました。どうしますか？
            </p>

            {dataConfirmModal.existingPlans.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">既存のプラン:</h4>
                <ul className="space-y-2">
                  {dataConfirmModal.existingPlans.map((plan) => (
                    <li key={plan.id} className="text-sm text-gray-600">
                      • {plan.name} (作成日: {new Date(plan.createdAt).toLocaleDateString('ja-JP')})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={handleUsePastData} className="w-full bg-blue-600 hover:bg-blue-700">
                過去データを使用する（ダッシュボードへ移動）
              </Button>

              <Button onClick={handleNotUsePastData} variant="outline" className="w-full">
                過去データを使用しない（新規作成を続行）
              </Button>

              <Button
                onClick={handleDiscardPastData}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                過去データを破棄する（完全削除）
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LifePlanCreate;
