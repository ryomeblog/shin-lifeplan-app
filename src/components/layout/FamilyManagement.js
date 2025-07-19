import React from 'react';
import { HiTrash, HiPencilSquare, HiPlus } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';

const FamilyManagement = ({ familyMembers, onAdd, onEdit, onDelete }) => {
  const formatAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();

    // 今年、まだ誕生日が来ていない場合、年齢を減らす。
    if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) return age;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">家族管理</h2>
          <p className="text-sm text-gray-600">家族メンバーを登録・管理します</p>
        </div>
        <Button onClick={onAdd}>
          <HiPlus className="h-4 w-4 mr-2" />
          家族を追加
        </Button>
      </div>

      <Card>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  生年月日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年齢
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  寿命設定
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {familyMembers.length > 0 ? (
                familyMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.birthDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAge(member.birthDate)}歳
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.lifeExpectancy}歳
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
                          <HiPencilSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(member.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <p>家族メンバーがいません</p>
                    <p className="text-sm mt-2">
                      「家族を追加」ボタンで新しいメンバーを追加できます
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FamilyManagement;
