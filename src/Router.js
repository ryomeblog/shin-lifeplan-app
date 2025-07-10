import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './components/pages/Home';
import LifePlanCreate from './components/pages/LifePlanCreate';
import Dashboard from './components/pages/NewDashboard';
import Transactions from './components/pages/Transactions';
import Accounts from './components/pages/Accounts';
import Assets from './components/pages/Assets';
import AssetDetail from './components/pages/AssetDetail';
import HoldingAssetDetail from './components/pages/HoldingAssetDetail';
import Reports from './components/pages/Reports';
import Settings from './components/pages/Settings';
import Events from './components/pages/Events';
import Templates from './components/pages/Templates';
import Categories from './components/pages/Categories';
import NotFound from './components/pages/NotFound';

// レイアウトラッパーコンポーネント
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// ルーター設定
const router = createBrowserRouter([
  {
    path: '/shin-lifeplan-app/',
    element: <Home />,
  },
  {
    path: '/shin-lifeplan-app/create',
    element: <LifePlanCreate />,
  },
  {
    path: '/shin-lifeplan-app/',
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
        path: 'assets/:assetId',
        element: <AssetDetail />,
      },
      {
        path: 'holding-assets/:holdingId',
        element: <HoldingAssetDetail />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'events',
        element: <Events />,
      },
      {
        path: 'templates',
        element: <Templates />,
      },
      {
        path: 'categories',
        element: <Categories />,
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
