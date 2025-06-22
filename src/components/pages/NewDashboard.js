import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { getActiveLifePlan } from '../../utils/storage';

const NewDashboard = () => {
  const [activeLifePlan, setActiveLifePlan] = useState(null);
  const [categoryTab, setCategoryTab] = useState('expenses'); // expenses or income
  const [templateTab, setTemplateTab] = useState('expenses'); // expenses, income, investment

  useEffect(() => {
    // アクティブなライフプランを取得
    try {
      const plan = getActiveLifePlan();
      setActiveLifePlan(plan);
    } catch (error) {
      console.error('ライフプラン読み込みエラー:', error);
    }
  }, []);

  // サンプルデータ
  const expenseCategories = [
    { name: '食費', amount: -50000 },
    { name: '交通費', amount: -30000 },
    { name: '住居費', amount: -100000 },
  ];

  const incomeCategories = [
    { name: '給与', amount: 300000 },
    { name: '副業', amount: 50000 },
    { name: 'ボーナス', amount: 500000 },
  ];

  const accounts = [
    { name: '普通預金', amount: 1000000 },
    { name: '貯蓄預金', amount: 2000000 },
    { name: '現金', amount: 50000 },
  ];

  const assets = [
    { name: '米国株式', amount: 3000000 },
    { name: '日本株式', amount: 2000000 },
    { name: '投資信託', amount: 1000000 },
  ];

  const expenseTemplates = [
    { name: '月末家賃支払い', amount: -100000 },
    { name: '水道光熱費', amount: -20000 },
    { name: '食費', amount: -50000 },
  ];

  const incomeTemplates = [
    { name: '月末給与', amount: 300000 },
    { name: '副業収入', amount: 50000 },
  ];

  const investmentTemplates = [
    { name: '積立NISA', amount: -33333 },
    { name: 'iDeCo', amount: -23000 },
  ];

  const yearData = [
    { year: 2023, income: 8000000, expenses: -5000000 },
    { year: 2024, income: 8500000, expenses: -5200000 },
    { year: 2025, income: 9000000, expenses: -5500000 },
  ];

  const familyMembers = activeLifePlan?.familyMembers || [
    { name: '山田太郎', age: 35, lifeExpectancy: 85 },
    { name: '山田花子', age: 32, lifeExpectancy: 88 },
    { name: '山田一郎', age: 5, lifeExpectancy: 85 },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getCurrentCategories = () => {
    return categoryTab === 'expenses' ? expenseCategories : incomeCategories;
  };

  const getCurrentTemplates = () => {
    switch (templateTab) {
      case 'income':
        return incomeTemplates;
      case 'investment':
        return investmentTemplates;
      default:
        return expenseTemplates;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* カテゴリ一覧と口座一覧 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* カテゴリ一覧 */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <Link to="/categories" className="text-blue-600 hover:text-blue-800">
                  カテゴリ一覧
                </Link>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setCategoryTab('expenses')}
                    className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                      categoryTab === 'expenses'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    支出
                  </button>
                  <button
                    onClick={() => setCategoryTab('income')}
                    className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                      categoryTab === 'income'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    収入
                  </button>
                </div>
              </div>
            }
          >
            <div className="space-y-2">
              {getCurrentCategories().map((category, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{category.name}</span>
                  <span
                    className={`font-semibold ${category.amount < 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 口座一覧 */}
          <Card
            title={
              <Link to="/accounts" className="text-blue-600 hover:text-blue-800">
                口座一覧
              </Link>
            }
          >
            <div className="space-y-2">
              {accounts.map((account, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{account.name}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(account.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 保有資産とテンプレート一覧 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 保有資産 */}
          <Card
            title={
              <Link to="/assets" className="text-blue-600 hover:text-blue-800">
                保有資産
              </Link>
            }
          >
            <div className="space-y-2">
              {assets.map((asset, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{asset.name}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(asset.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* テンプレート一覧 */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <Link to="/templates" className="text-blue-600 hover:text-blue-800">
                  テンプレート一覧
                </Link>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setTemplateTab('expenses')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      templateTab === 'expenses'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    支出
                  </button>
                  <button
                    onClick={() => setTemplateTab('income')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      templateTab === 'income'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    収入
                  </button>
                  <button
                    onClick={() => setTemplateTab('investment')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      templateTab === 'investment'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    投資
                  </button>
                </div>
              </div>
            }
          >
            <div className="space-y-2">
              {getCurrentTemplates().map((template, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{template.name}</span>
                  <span
                    className={`font-semibold ${template.amount < 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {formatCurrency(template.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 年選択と家族管理 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 年選択 */}
          <Card
            title={
              <Link to="/events" className="text-blue-600 hover:text-blue-800">
                年選択
              </Link>
            }
          >
            <div className="space-y-2">
              {yearData.map((data, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">{data.year}年</span>
                  </div>
                  <div className="mt-1 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-600">収入:</span>
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(data.income)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">支出:</span>
                      <span className="text-red-600 font-semibold">
                        {formatCurrency(data.expenses)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 家族管理 */}
          <Card
            title={
              <Link to="/family" className="text-blue-600 hover:text-blue-800">
                家族管理
              </Link>
            }
          >
            <div className="space-y-2">
              {familyMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{member.name}</span>
                  <span className="text-sm text-gray-600">
                    {member.age}歳 / 寿命 {member.lifeExpectancy}歳
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;
