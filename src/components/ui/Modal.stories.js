import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

export default {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full'],
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
    showCloseButton: {
      control: 'boolean',
    },
  },
};

const ModalTemplate = (args) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>モーダルを開く</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const Default = {
  render: ModalTemplate,
  args: {
    title: 'モーダルタイトル',
    children: 'モーダルの内容がここに表示されます。',
  },
};

export const WithFooter = {
  render: ModalTemplate,
  args: {
    title: 'フッター付きモーダル',
    children: 'モーダルの内容がここに表示されます。',
    footer: (
      <>
        <Button variant="secondary">キャンセル</Button>
        <Button variant="primary">保存</Button>
      </>
    ),
  },
};

export const NoTitle = {
  render: ModalTemplate,
  args: {
    children: 'タイトルなしのモーダルです。',
    showCloseButton: true,
  },
};

export const NoCloseButton = {
  render: ModalTemplate,
  args: {
    title: '閉じるボタンなし',
    children: 'このモーダルには閉じるボタンがありません。',
    showCloseButton: false,
    closeOnOverlayClick: true,
  },
};

export const FormModal = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', amount: '' });

    const handleSave = () => {
      alert(`保存: ${formData.name} - ¥${formData.amount}`);
      setIsOpen(false);
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>新規取引を追加</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="新規取引"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                キャンセル
              </Button>
              <Button variant="primary" onClick={handleSave}>
                保存
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="取引名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="食費"
            />
            <Input
              label="金額"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
            />
          </div>
        </Modal>
      </>
    );
  },
};

export const ConfirmationModal = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="danger" onClick={() => setIsOpen(true)}>
          削除
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="削除の確認"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                キャンセル
              </Button>
              <Button variant="danger" onClick={() => setIsOpen(false)}>
                削除
              </Button>
            </>
          }
        >
          <p>この取引を削除しますか？この操作は元に戻せません。</p>
        </Modal>
      </>
    );
  },
};

export const LargeModal = {
  render: ModalTemplate,
  args: {
    title: '大きなモーダル',
    size: 'xl',
    children: (
      <div className="space-y-4">
        <p>大きなモーダルの例です。</p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="左側の入力" />
          <Input label="右側の入力" />
        </div>
        <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
          大きなコンテンツエリア
        </div>
      </div>
    ),
  },
};
