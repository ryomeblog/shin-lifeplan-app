import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import LifePlanCreate from './LifePlanCreate';

export default {
  title: 'Pages/LifePlanCreate',
  component: LifePlanCreate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

// デフォルトのストーリー（新規作成）
export const Default = {
  render: () => <LifePlanCreate />,
};

// 既存データを編集する場合
export const EditMode = {
  render: () => {
    const existingData = {
      id: 'lp_001',
      name: '我が家のライフプラン',
      planStartYear: 2024,
      planEndYear: 2070,
      fireTargetAmount: '80,000,000',
      familyMembers: [
        {
          id: 'fm_001',
          name: '佐藤 太郎',
          birthDate: '1985-04-10',
          lifeExpectancy: 83,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_002',
          name: '佐藤 花子',
          birthDate: '1987-08-25',
          lifeExpectancy: 88,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_003',
          name: '佐藤 一郎',
          birthDate: '2015-03-12',
          lifeExpectancy: 85,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    return <LifePlanCreate initialData={existingData} />;
  },
};

// 空の状態（家族メンバーなし）
export const EmptyState = {
  render: () => {
    const emptyData = {
      planStartYear: 2025,
      planEndYear: 2055,
      fireTargetAmount: '',
      familyMembers: [],
    };

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-6">
          <p className="text-sm text-yellow-800">
            <strong>注意:</strong> この状態で保存ボタンを押すと、
            「少なくとも1人の家族メンバーを追加してください」というバリデーションエラーが表示されます。
          </p>
        </div>
        <LifePlanCreate initialData={emptyData} />
      </div>
    );
  },
};

// 大家族の例
export const LargeFamily = {
  render: () => {
    const largeFamilyData = {
      planStartYear: 2024,
      planEndYear: 2080,
      fireTargetAmount: '120,000,000',
      familyMembers: [
        {
          id: 'fm_001',
          name: '田中 太郎',
          birthDate: '1970-01-15',
          lifeExpectancy: 82,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_002',
          name: '田中 花子',
          birthDate: '1975-06-20',
          lifeExpectancy: 87,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_003',
          name: '田中 一郎',
          birthDate: '2005-03-10',
          lifeExpectancy: 85,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_004',
          name: '田中 二郎',
          birthDate: '2008-11-25',
          lifeExpectancy: 85,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_005',
          name: '田中 三郎',
          birthDate: '2012-07-08',
          lifeExpectancy: 85,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_006',
          name: '田中 おじいちゃん',
          birthDate: '1945-12-03',
          lifeExpectancy: 90,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_007',
          name: '田中 おばあちゃん',
          birthDate: '1950-09-18',
          lifeExpectancy: 92,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    };

    return <LifePlanCreate initialData={largeFamilyData} />;
  },
};

// FIRE計画なしの例
export const WithoutFIRE = {
  render: () => {
    const noFireData = {
      planStartYear: 2024,
      planEndYear: 2060,
      fireTargetAmount: '', // FIRE計画なし
      familyMembers: [
        {
          id: 'fm_001',
          name: '鈴木 太郎',
          birthDate: '1990-05-15',
          lifeExpectancy: 80,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'fm_002',
          name: '鈴木 花子',
          birthDate: '1992-12-03',
          lifeExpectancy: 85,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    };

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6">
          <p className="text-sm text-blue-800">
            <strong>参考:</strong> FIRE目標金額が空の場合、FIRE機能は無効として保存されます。
          </p>
        </div>
        <LifePlanCreate initialData={noFireData} />
      </div>
    );
  },
};

// インタラクティブなデモ
export const InteractiveDemo = {
  render: () => {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-6">
          <h3 className="font-semibold text-green-800 mb-2">インタラクティブデモ</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 家族メンバーを追加・編集・削除してみてください</li>
            <li>• 年間範囲やFIRE目標を設定してみてください</li>
            <li>• 保存ボタンを押すと詳細な結果がコンソールに表示されます</li>
            <li>• バリデーションエラーも確認できます</li>
          </ul>
        </div>
        <LifePlanCreate />
      </div>
    );
  },
};
