import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const FamilyMemberModal = ({
  isOpen = false,
  onClose,
  onSave,
  member = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    lifeExpectancy: '',
  });

  const [errors, setErrors] = useState({});

  // モーダルが開かれた時、編集データがあれば設定
  useEffect(() => {
    if (isOpen) {
      if (member && isEditing) {
        setFormData({
          name: member.name || '',
          birthDate: member.birthDate || '',
          lifeExpectancy: member.lifeExpectancy?.toString() || '',
        });
      } else {
        setFormData({
          name: '',
          birthDate: '',
          lifeExpectancy: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, member, isEditing]);

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

  const validateForm = () => {
    const newErrors = {};

    // 名前の検証
    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください';
    }

    // 生年月日の検証
    if (!formData.birthDate) {
      newErrors.birthDate = '生年月日を入力してください';
    } else {
      const birthDate = new Date(formData.birthDate);
      const currentDate = new Date();
      if (birthDate > currentDate) {
        newErrors.birthDate = '生年月日は現在の日付より前である必要があります';
      }
    }

    // 寿命設定の検証
    if (!formData.lifeExpectancy) {
      newErrors.lifeExpectancy = '寿命設定を入力してください';
    } else {
      const age = parseInt(formData.lifeExpectancy);
      if (isNaN(age) || age < 1 || age > 150) {
        newErrors.lifeExpectancy = '寿命は1-150の範囲で入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const memberData = {
      name: formData.name.trim(),
      birthDate: formData.birthDate,
      lifeExpectancy: parseInt(formData.lifeExpectancy),
    };

    if (isEditing && member) {
      memberData.id = member.id;
    }

    onSave(memberData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      birthDate: '',
      lifeExpectancy: '',
    });
    setErrors({});
    onClose();
  };

  const modalFooter = (
    <>
      <Button variant="outline" onClick={handleCancel}>
        キャンセル
      </Button>
      <Button onClick={handleSubmit}>保存</Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="家族メンバー情報"
      footer={modalFooter}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="例: 田中太郎"
            error={errors.name}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
          <Input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            error={errors.birthDate}
          />
          {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">寿命設定（年齢）</label>
          <Input
            type="number"
            min="1"
            max="150"
            value={formData.lifeExpectancy}
            onChange={(e) => handleInputChange('lifeExpectancy', e.target.value)}
            placeholder="例: 85"
            error={errors.lifeExpectancy}
          />
          {errors.lifeExpectancy && (
            <p className="mt-1 text-sm text-red-600">{errors.lifeExpectancy}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">目安: 男性 80-85歳、女性 85-90歳</p>
        </div>
      </div>
    </Modal>
  );
};

export default FamilyMemberModal;
