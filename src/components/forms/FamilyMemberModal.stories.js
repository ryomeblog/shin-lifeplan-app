import React, { useState } from 'react';
import FamilyMemberModal from './FamilyMemberModal';

export default {
  title: 'Forms/FamilyMemberModal',
  component: FamilyMemberModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

// デフォルトのストーリー
export const Default = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [members, setMembers] = useState([]);

    const handleSave = (memberData) => {
      console.log('保存されたデータ:', memberData);
      setMembers((prev) => [...prev, { ...memberData, id: `fm_${Date.now()}` }]);
      setIsOpen(false);
    };

    return (
      <div className="p-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          モーダルを開く
        </button>

        <FamilyMemberModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSave={handleSave} />

        {members.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">追加された家族メンバー:</h3>
            <ul className="space-y-1">
              {members.map((member, index) => (
                <li key={index} className="text-sm">
                  {member.name} ({member.birthDate}) - {member.lifeExpectancy}歳まで
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

// 新規追加モード
export const AddMode = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    const handleSave = (memberData) => {
      console.log('新規追加:', memberData);
      setIsOpen(false);
    };

    return (
      <FamilyMemberModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        isEditing={false}
      />
    );
  },
};

// 編集モード
export const EditMode = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    const existingMember = {
      id: 'fm_001',
      name: '山田 太郎',
      birthDate: '1990-01-01',
      lifeExpectancy: 80,
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    const handleSave = (memberData) => {
      console.log('編集保存:', memberData);
      setIsOpen(false);
    };

    return (
      <FamilyMemberModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        member={existingMember}
        isEditing={true}
      />
    );
  },
};

// バリデーションエラーの例
export const ValidationErrors = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    const handleSave = (memberData) => {
      console.log('バリデーション後保存:', memberData);
      setIsOpen(false);
    };

    return (
      <div className="p-4">
        <p className="mb-4 text-sm text-gray-600">
          空の状態で保存ボタンを押すとバリデーションエラーが表示されます
        </p>
        <FamilyMemberModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSave={handleSave} />
      </div>
    );
  },
};

// プリセットデータの例
export const WithPresetData = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [currentMember, setCurrentMember] = useState(null);

    const presetMembers = [
      {
        id: 'fm_001',
        name: '田中 太郎',
        birthDate: '1985-03-15',
        lifeExpectancy: 82,
      },
      {
        id: 'fm_002',
        name: '田中 花子',
        birthDate: '1988-07-22',
        lifeExpectancy: 87,
      },
      {
        id: 'fm_003',
        name: '田中 一郎',
        birthDate: '2015-12-01',
        lifeExpectancy: 85,
      },
    ];

    const handleSave = (memberData) => {
      console.log('保存:', memberData);
      setIsOpen(false);
    };

    const openModal = (member = null) => {
      setCurrentMember(member);
      setIsOpen(true);
    };

    return (
      <div className="p-4 space-y-4">
        <div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
          >
            新規追加
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">既存メンバー（クリックで編集）:</h3>
          <div className="space-y-2">
            {presetMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => openModal(member)}
                className="block w-full text-left p-3 border rounded hover:bg-gray-50"
              >
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-gray-600">
                  {new Date(member.birthDate).toLocaleDateString('ja-JP')} - {member.lifeExpectancy}
                  歳まで
                </div>
              </button>
            ))}
          </div>
        </div>

        <FamilyMemberModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
          member={currentMember}
          isEditing={Boolean(currentMember)}
        />
      </div>
    );
  },
};
