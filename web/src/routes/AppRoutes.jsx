import React from 'react';
import { Route, Routes } from 'react-router-dom';

// ページコンポーネントのインポート
import HomePage from '../pages/HomePage';
import LifePlanCreatePage from '../pages/LifePlanCreatePage';
import ExpensesPage from '../pages/ExpensesPage';
// import YearlyBalancePage from '../pages/YearlyBalancePage';
// import EventListPage from '../pages/EventListPage';
// import IncomeGraphPage from '../pages/IncomeGraphPage';
// import ExpenseGraphPage from '../pages/ExpenseGraphPage';
// import AssetGraphPage from '../pages/AssetGraphPage';
// import CategoryListPage from '../pages/CategoryListPage';
// import FamilyListPage from '../pages/FamilyListPage';
import SalaryInputPage from '../pages/SalaryInputPage';
import IncomeInputPage from '../pages/IncomeInputPage';
import NotFound from '../pages/error/NotFound'
import { BASE_PATH } from '../config/constants';

function AppRoutes() {
  return (
    <Routes>
      {/* ホーム画面 */}
      <Route path={`${BASE_PATH}/`} element={<HomePage mode={"cute"} />} />
      
      {/* ライフプラン関連 */}
      <Route path={`${BASE_PATH}/create-life-plan`} element={<LifePlanCreatePage />} />
      
      {/* 支出関連 */}
      <Route path={`${BASE_PATH}/expenses`} element={<ExpensesPage mode={"cute"} />} />
      {/* <Route path="/expense-graph" element={<ExpenseGraphPage />} /> */}
      
      {/* 収入関連 */}
      {/* <Route path="/income-graph" element={<IncomeGraphPage />} /> */}
      <Route path={`${BASE_PATH}/income-input`} element={<IncomeInputPage />} />
      <Route path={`${BASE_PATH}/income-input/salary`} element={<SalaryInputPage />} />
      
      {/* 年別収支 */}
      {/* <Route path="/yearly-balance" element={<YearlyBalancePage />} /> */}
      
      {/* イベント */}
      {/* <Route path="/events" element={<EventListPage />} /> */}
      
      {/* 資産 */}
      {/* <Route path="/asset-graph" element={<AssetGraphPage />} /> */}
      
      {/* カテゴリ */}
      {/* <Route path="/categories" element={<CategoryListPage />} /> */}
      
      {/* 家族 */}
      {/* <Route path="/family" element={<FamilyListPage />} /> */}

      {/* NotFoundページ - 必ず最後に配置 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;