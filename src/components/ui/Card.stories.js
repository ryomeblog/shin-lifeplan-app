import React from 'react';
import Card from './Card';
import Button from './Button';
import CurrencyDisplay from './CurrencyDisplay';
import { FiMoreVertical, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
    },
    border: {
      control: 'boolean',
    },
    hover: {
      control: 'boolean',
    },
  },
};

export const Default = {
  args: {
    children: 'カードの内容がここに表示されます。',
  },
};

export const WithTitle = {
  args: {
    title: 'カードタイトル',
    children: 'カードの内容がここに表示されます。',
  },
};

export const WithTitleAndSubtitle = {
  args: {
    title: 'カードタイトル',
    subtitle: 'サブタイトル',
    children: 'カードの内容がここに表示されます。',
  },
};

export const WithActions = {
  args: {
    title: 'アクション付きカード',
    actions: (
      <Button variant="ghost" size="sm">
        <FiMoreVertical />
      </Button>
    ),
    children: 'カードの内容がここに表示されます。',
  },
};

export const Hoverable = {
  args: {
    title: 'ホバー可能なカード',
    hover: true,
    children: 'このカードはホバーエフェクトがあります。',
  },
};

export const Clickable = {
  args: {
    title: 'クリック可能なカード',
    hover: true,
    onClick: () => alert('カードがクリックされました！'),
    children: 'このカードはクリック可能です。',
  },
};

export const NoBorder = {
  args: {
    title: 'ボーダーなし',
    border: false,
    children: 'このカードにはボーダーがありません。',
  },
};

export const DifferentShadows = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-96">
      <Card title="影なし" shadow="none">
        内容
      </Card>
      <Card title="小さな影" shadow="sm">
        内容
      </Card>
      <Card title="中くらいの影" shadow="md">
        内容
      </Card>
      <Card title="大きな影" shadow="lg">
        内容
      </Card>
    </div>
  ),
};

export const AccountCard = {
  render: () => (
    <Card
      title="普通預金"
      subtitle="三菱UFJ銀行"
      actions={
        <Button variant="ghost" size="sm">
          <FiMoreVertical />
        </Button>
      }
      className="w-80"
    >
      <div className="flex justify-between items-center">
        <span className="text-gray-600">残高</span>
        <CurrencyDisplay amount={1000000} size="lg" colorByValue={false} />
      </div>
    </Card>
  ),
};

export const CategoryCard = {
  render: () => (
    <Card
      title="食費"
      actions={
        <div className="flex items-center space-x-2">
          <FiTrendingDown className="text-red-500" />
          <span className="text-sm text-gray-600">月平均</span>
        </div>
      }
      hover
      className="w-80"
    >
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>今月の支出</span>
          <CurrencyDisplay amount={-45000} />
        </div>
        <div className="flex justify-between">
          <span>予算</span>
          <CurrencyDisplay amount={-50000} colorByValue={false} />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-red-500 h-2 rounded-full" style={{ width: '90%' }}></div>
        </div>
      </div>
    </Card>
  ),
};

export const AssetCard = {
  render: () => (
    <Card
      title="米国株式 (VOO)"
      subtitle="バンガード S&P 500 ETF"
      actions={<FiTrendingUp className="text-green-500" />}
      className="w-80"
    >
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>保有数</span>
          <span className="font-medium">100株</span>
        </div>
        <div className="flex justify-between">
          <span>評価額</span>
          <CurrencyDisplay amount={5000000} size="lg" colorByValue={false} />
        </div>
        <div className="flex justify-between">
          <span>評価損益</span>
          <CurrencyDisplay amount={500000} />
        </div>
      </div>
    </Card>
  ),
};
