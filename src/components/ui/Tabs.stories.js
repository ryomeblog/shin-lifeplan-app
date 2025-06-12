import React from 'react';
import Tabs from './Tabs';
import Card from './Card';
import CurrencyDisplay from './CurrencyDisplay';
import { FiDollarSign, FiTrendingUp, FiRefreshCw, FiPieChart } from 'react-icons/fi';

export default {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'pills', 'underline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

const basicTabs = [
  {
    key: 'tab1',
    label: 'タブ1',
    content: <div className="p-4">タブ1の内容です。</div>,
  },
  {
    key: 'tab2',
    label: 'タブ2',
    content: <div className="p-4">タブ2の内容です。</div>,
  },
  {
    key: 'tab3',
    label: 'タブ3',
    content: <div className="p-4">タブ3の内容です。</div>,
  },
];

export const Default = {
  args: {
    tabs: basicTabs,
    className: 'w-96',
  },
};

export const Pills = {
  args: {
    tabs: basicTabs,
    variant: 'pills',
    className: 'w-96',
  },
};

export const Underline = {
  args: {
    tabs: basicTabs,
    variant: 'underline',
    className: 'w-96',
  },
};

export const WithIcons = {
  args: {
    tabs: [
      {
        key: 'expense',
        label: '支出',
        icon: <FiDollarSign />,
        content: <div className="p-4">支出取引の一覧です。</div>,
      },
      {
        key: 'income',
        label: '収入',
        icon: <FiTrendingUp />,
        content: <div className="p-4">収入取引の一覧です。</div>,
      },
      {
        key: 'transfer',
        label: '振替',
        icon: <FiRefreshCw />,
        content: <div className="p-4">振替取引の一覧です。</div>,
      },
    ],
    variant: 'pills',
    className: 'w-96',
  },
};

export const WithBadges = {
  args: {
    tabs: [
      {
        key: 'all',
        label: 'すべて',
        badge: '25',
        content: <div className="p-4">すべての取引（25件）</div>,
      },
      {
        key: 'pending',
        label: '保留中',
        badge: '3',
        content: <div className="p-4">保留中の取引（3件）</div>,
      },
      {
        key: 'completed',
        label: '完了',
        badge: '22',
        content: <div className="p-4">完了した取引（22件）</div>,
      },
    ],
    className: 'w-96',
  },
};

export const TransactionTabs = {
  args: {
    tabs: [
      {
        key: 'expense',
        label: '支出',
        icon: <FiDollarSign />,
        content: (
          <div className="space-y-4">
            <Card title="食費" className="w-full">
              <div className="flex justify-between">
                <span>今月の支出</span>
                <CurrencyDisplay amount={-45000} />
              </div>
            </Card>
            <Card title="住居費" className="w-full">
              <div className="flex justify-between">
                <span>今月の支出</span>
                <CurrencyDisplay amount={-100000} />
              </div>
            </Card>
          </div>
        ),
      },
      {
        key: 'income',
        label: '収入',
        icon: <FiTrendingUp />,
        content: (
          <div className="space-y-4">
            <Card title="給与" className="w-full">
              <div className="flex justify-between">
                <span>今月の収入</span>
                <CurrencyDisplay amount={300000} />
              </div>
            </Card>
            <Card title="副業" className="w-full">
              <div className="flex justify-between">
                <span>今月の収入</span>
                <CurrencyDisplay amount={50000} />
              </div>
            </Card>
          </div>
        ),
      },
      {
        key: 'transfer',
        label: '振替',
        icon: <FiRefreshCw />,
        content: (
          <div className="space-y-4">
            <Card title="貯金" className="w-full">
              <div className="flex justify-between">
                <span>普通預金 → 貯蓄預金</span>
                <span className="font-medium">¥100,000</span>
              </div>
            </Card>
          </div>
        ),
      },
      {
        key: 'investment',
        label: '投資',
        icon: <FiPieChart />,
        content: (
          <div className="space-y-4">
            <Card title="米国株式" className="w-full">
              <div className="flex justify-between">
                <span>VOO 購入</span>
                <CurrencyDisplay amount={-500000} />
              </div>
            </Card>
          </div>
        ),
      },
    ],
    variant: 'default',
    className: 'w-full max-w-2xl',
  },
};

export const DisabledTab = {
  args: {
    tabs: [
      {
        key: 'active1',
        label: 'アクティブ1',
        content: <div className="p-4">アクティブなタブ1</div>,
      },
      {
        key: 'disabled',
        label: '無効',
        disabled: true,
        content: <div className="p-4">無効なタブ</div>,
      },
      {
        key: 'active2',
        label: 'アクティブ2',
        content: <div className="p-4">アクティブなタブ2</div>,
      },
    ],
    className: 'w-96',
  },
};
