import React from 'react';
import { HiTrash } from 'react-icons/hi2';
import Button from '../ui/Button';
import Card from '../ui/Card';

const LifePlanList = ({ lifePlans, activeLifePlanId, onDelete }) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">ライフプラン一覧</h3>
      <Card>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ライフプラン名
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lifePlans.length > 0 ? (
                lifePlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.name}
                      {plan.id === activeLifePlanId && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          現在使用中
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(plan.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        disabled={plan.id === activeLifePlanId}
                      >
                        <HiTrash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                    <p>ライフプランがありません</p>
                    <p className="text-sm mt-2">新しいライフプランを作成してください</p>
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

export default LifePlanList;
