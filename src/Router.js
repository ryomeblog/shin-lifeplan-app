import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LifePlanCreate from './components/layout/LifePlanCreate';
import Dashboard from './components/pages/Dashboard';
import Transactions from './components/pages/Transactions';
import Accounts from './components/pages/Accounts';
import Assets from './components/pages/Assets';
import Reports from './components/pages/Reports';
import Settings from './components/pages/Settings';
import NotFound from './components/pages/NotFound';

// レイアウトラッパーコンポーネント
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// ライフプラン作成ページ用のハンドラー
const LifePlanCreatePage = () => {
  const handleSave = (lifePlanData) => {
    console.log('ライフプランデータを保存:', lifePlanData);
    // 将来的にはダッシュボードに遷移
    // navigate('/dashboard');
    alert('ライフプランが保存されました！');
  };

  const handleCancel = () => {
    if (window.confirm('作成をキャンセルしますか？')) {
      console.log('ライフプラン作成をキャンセル');
    }
  };

  return <LifePlanCreate onSave={handleSave} onCancel={handleCancel} />;
};

// ルーター設定
const router = createBrowserRouter([
  {
    path: '/',
    element: <LifePlanCreatePage />,
  },
  {
    path: '/',
    element: <LayoutWrapper />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'accounts',
        element: <Accounts />,
      },
      {
        path: 'assets',
        element: <Assets />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// メインのAppRouterコンポーネント
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
