import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiCog6Tooth, HiChevronDown } from 'react-icons/hi2';
import { getLifePlans, getActiveLifePlanId, setActiveLifePlanId } from '../../utils/storage';

const Header = () => {
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState('ライフプラン未選択');
  const [lifePlans, setLifePlans] = useState([]);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  // ストレージからライフプランを読み込み
  useEffect(() => {
    try {
      const plans = getLifePlans();
      setLifePlans(plans);

      // 選択されたプランがある場合は設定
      const activePlanId = getActiveLifePlanId();
      if (activePlanId && plans.length > 0) {
        const plan = plans.find((p) => p.id === activePlanId);
        if (plan) {
          setSelectedPlan(plan.name);
        }
      } else if (plans.length > 0) {
        setSelectedPlan(plans[0].name);
        setActiveLifePlanId(plans[0].id);
      }
    } catch (error) {
      console.error('ライフプラン読み込みエラー:', error);
    }
  }, []);

  const menuItems = [
    { path: '/dashboard', label: 'ダッシュボード' },
    { path: '/transactions', label: '取引' },
    { path: '/events', label: 'イベント' },
    { path: '/reports', label: 'レポート' },
    { path: '/accounts', label: '口座' },
    { path: '/assets', label: '資産' },
    { path: '/templates', label: 'テンプレート' },
    { path: '/categories', label: 'カテゴリ' },
  ];

  const isActive = (path) => location.pathname === path;

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan.name);
    setActiveLifePlanId(plan.id);
    setShowPlanDropdown(false);
    // ページリロードして新しいプランのデータを反映
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
              LifePlan
            </Link>
          </div>

          {/* ライフプラン選択 */}
          <div className="relative ml-6">
            <button
              onClick={() => setShowPlanDropdown(!showPlanDropdown)}
              className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-sm font-medium">{selectedPlan}</span>
              <HiChevronDown className="ml-2 h-4 w-4" />
            </button>

            {showPlanDropdown && (
              <div className="absolute top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  {lifePlans.length > 0 ? (
                    lifePlans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {plan.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">ライフプランがありません</div>
                  )}
                  <Link
                    to="/create"
                    className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 border-t border-gray-200"
                    onClick={() => setShowPlanDropdown(false)}
                  >
                    + 新しいプランを作成
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* メニュー */}
          <nav className="hidden md:flex space-x-1 ml-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 設定ボタン */}
          <div className="flex items-center ml-4">
            <Link
              to="/settings"
              className={`p-2 rounded-full transition-colors ${
                isActive('/settings')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HiCog6Tooth className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <nav className="md:hidden bg-white border-t border-gray-200">
        <div className="px-2 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            {menuItems.slice(0, 5).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive(item.path) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
