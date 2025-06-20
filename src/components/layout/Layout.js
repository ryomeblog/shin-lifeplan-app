import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiHome,
  HiCreditCard,
  HiBanknotes,
  HiChartBar,
  HiDocumentText,
  HiCog6Tooth,
} from 'react-icons/hi2';

const Layout = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: HiHome },
    { path: '/transactions', label: '取引管理', icon: HiBanknotes },
    { path: '/accounts', label: '口座管理', icon: HiCreditCard },
    { path: '/assets', label: '資産管理', icon: HiChartBar },
    { path: '/reports', label: 'レポート', icon: HiDocumentText },
    { path: '/settings', label: '設定', icon: HiCog6Tooth },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                LifePlan
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* モバイルナビゲーション */}
      <nav className="md:hidden bg-white border-b">
        <div className="px-2 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center min-w-0 flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
