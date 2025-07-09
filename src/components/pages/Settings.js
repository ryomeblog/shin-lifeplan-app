import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import FamilyMemberModal from '../forms/FamilyMemberModal';
import BasicSettingsForm from '../forms/BasicSettingsForm';
import FireSettingsForm from '../forms/FireSettingsForm';
import LifePlanList from '../layout/LifePlanList';
import FamilyManagement from '../layout/FamilyManagement';
import DataManagement from '../layout/DataManagement';
import SettingsNavigation from '../layout/SettingsNavigation';
import {
  getLifePlans,
  getActiveLifePlanId,
  deleteLifePlan,
  setActiveLifePlanId,
  getFamilyMembers,
  saveFamilyMembers,
  exportData,
  importData,
} from '../../utils/storage';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [lifePlans, setLifePlans] = useState([]);
  const [activeLifePlanId, setActiveLifePlanIdState] = useState('');
  const [familyMembers, setFamilyMembersState] = useState([]);

  // モーダル状態
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // データ読み込み
  useEffect(() => {
    const loadData = () => {
      try {
        const plans = getLifePlans();
        setLifePlans(plans);

        const activePlanId = getActiveLifePlanId();
        setActiveLifePlanIdState(activePlanId);

        const members = getFamilyMembers();
        setFamilyMembersState(members);
      } catch (error) {
        console.error('設定データ読み込みエラー:', error);
      }
    };

    loadData();
  }, []);

  // ライフプラン削除
  const handleDeleteLifePlan = (planId) => {
    if (window.confirm('このライフプランを削除しますか？\n削除すると元に戻せません。')) {
      try {
        // アクティブプランを削除する場合の処理
        if (planId === activeLifePlanId) {
          const remainingPlans = lifePlans.filter((p) => p.id !== planId);
          if (remainingPlans.length > 0) {
            // 他のプランがある場合は最初のプランをアクティブに
            setActiveLifePlanId(remainingPlans[0].id);
            setActiveLifePlanIdState(remainingPlans[0].id);
          } else {
            // プランがなくなる場合はアクティブプランをクリア
            setActiveLifePlanIdState('');
          }
        }

        // プランを削除
        const success = deleteLifePlan(planId);
        if (success) {
          const updatedPlans = lifePlans.filter((p) => p.id !== planId);
          setLifePlans(updatedPlans);

          // 家族メンバーを再読み込み（アクティブプランが変わった場合）
          const members = getFamilyMembers();
          setFamilyMembersState(members);

          alert('ライフプランを削除しました');
        } else {
          alert('ライフプランの削除に失敗しました');
        }
      } catch (error) {
        console.error('ライフプラン削除エラー:', error);
        alert('ライフプランの削除中にエラーが発生しました');
      }
    }
  };

  // 基本設定保存
  const handleSaveBasicSettings = (settingsData) => {
    console.log('基本設定保存:', settingsData);
    alert('設定を保存しました');
  };

  // 家族メンバー追加
  const handleAddFamilyMember = () => {
    setEditingMember(null);
    setIsFamilyModalOpen(true);
  };

  // 家族メンバー編集
  const handleEditFamilyMember = (member) => {
    setEditingMember(member);
    setIsFamilyModalOpen(true);
  };

  // 家族メンバー削除
  const handleDeleteFamilyMember = (memberId) => {
    if (window.confirm('この家族メンバーを削除しますか？')) {
      const updatedMembers = familyMembers.filter((m) => m.id !== memberId);
      setFamilyMembersState(updatedMembers);
      saveFamilyMembers(updatedMembers);
    }
  };

  // 家族メンバー保存
  const handleSaveFamilyMember = (memberData) => {
    let updatedMembers;
    if (editingMember) {
      updatedMembers = familyMembers.map((m) => (m.id === editingMember.id ? memberData : m));
    } else {
      updatedMembers = [
        ...familyMembers,
        {
          ...memberData,
          id: `fm_${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    setFamilyMembersState(updatedMembers);
    saveFamilyMembers(updatedMembers);
  };

  // データエクスポート
  const handleExportData = () => {
    try {
      exportData();
      alert('データをエクスポートしました');
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('エクスポートに失敗しました');
    }
  };

  // データインポート
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await importData(file);
          alert('データをインポートしました');
          window.location.reload();
        } catch (error) {
          console.error('インポートエラー:', error);
          alert('インポートに失敗しました');
        }
      }
    };
    input.click();
  };

  // FIRE設定保存
  const handleSaveFireSettings = (fireSettings) => {
    console.log('FIRE設定保存:', fireSettings);
    alert('FIRE設定を保存しました');
  };

  // 基本設定コンテンツ
  const BasicSettingsContent = () => (
    <div className="space-y-8">
      <BasicSettingsForm onSave={handleSaveBasicSettings} />
      <LifePlanList
        lifePlans={lifePlans}
        activeLifePlanId={activeLifePlanId}
        onDelete={handleDeleteLifePlan}
      />
    </div>
  );

  // 詳細設定コンテンツ
  const DetailSettingsContent = () => (
    <div className="space-y-8">
      <FamilyManagement
        familyMembers={familyMembers}
        onAdd={handleAddFamilyMember}
        onEdit={handleEditFamilyMember}
        onDelete={handleDeleteFamilyMember}
      />

      <DataManagement onExport={handleExportData} onImport={handleImportData} />
    </div>
  );

  // FIRE計画コンテンツ
  const FireSettingsContent = () => <FireSettingsForm onSave={handleSaveFireSettings} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* サイドバー */}
          <div className="col-span-3">
            <SettingsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* メインコンテンツ */}
          <div className="col-span-9">
            <Card>
              {activeTab === 'basic' && <BasicSettingsContent />}
              {activeTab === 'detail' && <DetailSettingsContent />}
              {activeTab === 'fire' && <FireSettingsContent />}
            </Card>
          </div>
        </div>
      </div>

      {/* 家族メンバーモーダル */}
      <FamilyMemberModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        onSave={handleSaveFamilyMember}
        member={editingMember}
        isEditing={!!editingMember}
      />
    </div>
  );
};

export default Settings;
