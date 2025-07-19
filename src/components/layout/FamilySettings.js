import React from 'react';
import { HiPlus, HiPencilSquare, HiTrash } from 'react-icons/hi2';
import Button from '../ui/Button';
import Table from '../ui/Table';
import Card from '../ui/Card';

const FamilySettings = ({ familyMembers, onAddMember, onEditMember, onDeleteMember, errors }) => {
  const currentDate = new Date();

  // 年齢計算関数
  const calculateAge = (birthDate, today = currentDate) => {
    // !!-CAUTION-!! type of birthDate is string.
    birthDate = new Date(birthDate);

    let age = today.getFullYear() - birthDate.getFullYear();

    // 今年、まだ誕生日が来ていない場合、年齢を減らす
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;

    return age;
  };

  // テーブルの列定義
  const tableColumns = [
    {
      key: 'name',
      title: '名前',
    },
    {
      key: 'birthDate',
      title: '生年月日',
      render: (value) => new Date(value).toLocaleDateString('ja-JP'),
    },
    {
      key: 'age',
      title: '現在年齢',
      render: (_, row) => `${calculateAge(row.birthDate)}歳`,
    },
    {
      key: 'lifeExpectancy',
      title: '寿命設定',
      render: (value) => `${value}歳`,
    },
    {
      key: 'actions',
      title: '操作',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => onEditMember(row)}>
            <HiPencilSquare className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDeleteMember(row.id)}
            className="text-red-600 hover:text-red-700"
          >
            <HiTrash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card
      title="家族構成設定"
      actions={
        <Button onClick={onAddMember} size="sm" className="flex items-center space-x-1">
          <HiPlus className="h-4 w-4" />
          <span>家族メンバーを追加</span>
        </Button>
      }
    >
      {familyMembers.length > 0 ? (
        <Table data={familyMembers} columns={tableColumns} />
      ) : (
        <div className="text-center py-8 text-gray-500">家族メンバーを追加してください</div>
      )}
      {errors.familyMembers && <p className="mt-2 text-sm text-red-600">{errors.familyMembers}</p>}
    </Card>
  );
};

export default FamilySettings;
