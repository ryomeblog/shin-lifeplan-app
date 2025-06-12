import React from 'react';
import Input from './Input';
import { FiUser, FiMail, FiSearch, FiEye } from 'react-icons/fi';

export default {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
};

export const Default = {
  args: {
    placeholder: 'テキストを入力してください',
  },
};

export const WithLabel = {
  args: {
    label: 'お名前',
    placeholder: '山田太郎',
    required: true,
  },
};

export const WithIcon = {
  args: {
    label: 'ユーザー名',
    placeholder: 'ユーザー名を入力',
    icon: <FiUser />,
  },
};

export const WithRightIcon = {
  args: {
    label: 'パスワード',
    type: 'password',
    placeholder: 'パスワードを入力',
    rightIcon: <FiEye />,
  },
};

export const Email = {
  args: {
    label: 'メールアドレス',
    type: 'email',
    placeholder: 'example@example.com',
    icon: <FiMail />,
  },
};

export const Number = {
  args: {
    label: '金額',
    type: 'number',
    placeholder: '0',
  },
};

export const Search = {
  args: {
    placeholder: '検索...',
    icon: <FiSearch />,
  },
};

export const WithHelperText = {
  args: {
    label: 'パスワード',
    type: 'password',
    placeholder: 'パスワードを入力',
    helperText: '8文字以上で入力してください',
  },
};

export const Error = {
  args: {
    label: 'メールアドレス',
    type: 'email',
    value: 'invalid-email',
    error: true,
    helperText: '正しいメールアドレスを入力してください',
  },
};

export const Disabled = {
  args: {
    label: '読み取り専用',
    value: '編集できません',
    disabled: true,
  },
};

export const Sizes = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input size="sm" placeholder="小サイズ" />
      <Input size="md" placeholder="中サイズ" />
      <Input size="lg" placeholder="大サイズ" />
    </div>
  ),
};

export const LifePlanForm = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input label="取引名" placeholder="食費" required />
      <Input label="金額" type="number" placeholder="0" rightIcon="¥" />
      <Input label="メモ" placeholder="備考を入力（任意）" />
    </div>
  ),
};
