import React from 'react';
import Button from './Button';
import { FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
  },
};

export const Default = {
  args: {
    children: 'ボタン',
  },
};

export const Primary = {
  args: {
    children: '保存',
    variant: 'primary',
  },
};

export const Secondary = {
  args: {
    children: 'キャンセル',
    variant: 'secondary',
  },
};

export const Success = {
  args: {
    children: '完了',
    variant: 'success',
  },
};

export const Danger = {
  args: {
    children: '削除',
    variant: 'danger',
  },
};

export const Warning = {
  args: {
    children: '警告',
    variant: 'warning',
  },
};

export const Outline = {
  args: {
    children: 'アウトライン',
    variant: 'outline',
  },
};

export const Ghost = {
  args: {
    children: 'ゴースト',
    variant: 'ghost',
  },
};

export const WithIcon = {
  args: {
    children: '新規作成',
    icon: <FiPlus />,
    variant: 'primary',
  },
};

export const Loading = {
  args: {
    children: '保存中...',
    loading: true,
    variant: 'primary',
  },
};

export const Disabled = {
  args: {
    children: '無効',
    disabled: true,
  },
};

export const Sizes = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Button size="sm">小</Button>
      <Button size="md">中</Button>
      <Button size="lg">大</Button>
      <Button size="xl">特大</Button>
    </div>
  ),
};

export const LifePlanExample = {
  render: () => (
    <div className="flex space-x-4">
      <Button variant="primary" icon={<FiSave />}>
        取引を保存
      </Button>
      <Button variant="outline" icon={<FiPlus />}>
        新規取引
      </Button>
      <Button variant="danger" icon={<FiTrash2 />}>
        削除
      </Button>
    </div>
  ),
};
