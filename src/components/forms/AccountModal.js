import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AccountModal = ({ isOpen, onClose, onSave, account, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    initialBalance: '',
    memo: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && account) {
      setFormData({
        name: account.name || '',
        initialBalance: account.initialBalance?.toString() || '',
        memo: account.memo || '',
      });
    } else {
      setFormData({
        name: '',
        initialBalance: '',
        memo: '',
      });
    }
    setErrors({});
  }, [isEditing, account, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '口座名を入力してください';
    }

    if (!formData.initialBalance.trim()) {
      newErrors.initialBalance = '初期残高を入力してください';
    } else {
      const balance = parseFloat(formData.initialBalance.replace(/[^0-9.-]/g, ''));
      if (isNaN(balance)) {
        newErrors.initialBalance = '正しい金額を入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const balance = parseFloat(formData.initialBalance.replace(/[^0-9.-]/g, '')) || 0;

    const accountData = {
      id: account?.id || `acc_${Date.now()}`,
      name: formData.name.trim(),
      initialBalance: balance,
      memo: formData.memo.trim(),
      displayOrder: account?.displayOrder || 1,
      createdAt: account?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(accountData);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? '口座編集' : '口座登録'}>
      <div className="space-y-4">
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="口座名を入力"
          label="口座名"
          error={errors.name}
        />

        <Input
          type="text"
          value={formData.initialBalance}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.-]/g, '');
            handleInputChange('initialBalance', value);
          }}
          placeholder="初期残高を入力"
          label="初期残高"
          error={errors.initialBalance}
        />

        <Input
          type="text"
          value={formData.memo}
          onChange={(e) => handleInputChange('memo', e.target.value)}
          placeholder="メモを入力..."
          label="メモ（任意）"
        />

        <div className="flex space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            キャンセル
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AccountModal;
