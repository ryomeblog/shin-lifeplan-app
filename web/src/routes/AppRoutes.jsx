import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box } from "@mui/material";

// コンポーネントのインポート
import Header from "../components/Layout/Header";
import Sidebar from "../components/Layout/Sidebar";
import HomePage from "../pages/HomePage";
import LifePlanCreatePage from "../pages/LifePlanCreatePage";
import ExpensesPage from "../pages/ExpensesPage";
import SalaryInputPage from "../pages/SalaryInputPage";
import IncomeInputPage from "../pages/IncomeInputPage";
import NotFound from "../pages/error/NotFound";
import { BASE_PATH } from "../config/constants";

const sampleExpenses = [
  {
    year: 2024,
    expenses: [
      {
        id: 1,
        name: "食費",
        payment: 50000,
        monthly: 1,
        category: "食費",
        group: "生活必需品",
        categoryDescription: "日々の食事や食材の購入に関する支出です。",
        groupDescription: "生活を営む上で必要不可欠な支出グループです。",
      },
      {
        id: 2,
        name: "家賃",
        payment: 100000,
        monthly: 12,
        category: "住居費",
        group: "生活必需品",
        categoryDescription: "住居に関する固定費です。",
        groupDescription: "生活を営む上で必要不可欠な支出グループです。",
      },
      {
        id: 3,
        name: "通信費",
        payment: 10000,
        monthly: 1,
        category: "通信費",
        group: "生活必需品",
        categoryDescription: "携帯電話やインターネットの利用料金です。",
        groupDescription: "生活を営む上で必要不可欠な支出グループです。",
      },
      {
        id: 4,
        name: "交通費",
        payment: 20000,
        monthly: 1,
        category: "その他",
        group: "生活費",
        categoryDescription: "通勤や移動に関する支出です。",
        groupDescription: "日常生活を快適に過ごすための支出グループです。",
      },
      {
        id: 5,
        name: "娯楽費",
        payment: 300000,
        monthly: 12,
        category: "趣味・旅行・交際費",
        group: "生活費",
        categoryDescription: "趣味や娯楽に関する支出です。",
        groupDescription: "日常生活を快適に過ごすための支出グループです。",
      },
    ],
  },
];

const lifeplans = [
  {
    lifeplanId: 1,
    lifeplanName: "30代ライフプラン",
    lifeplanDescription: "30代のライフプランを作成します。",
    lifeplanInflationRate: 2.5,
    paymentCategoryList: [
      "食費",
      "住居費",
      "消耗品",
      "耐久消耗品",
      "水道光熱費",
      "通信費",
      "趣味・旅行・交際費",
      "保険",
      "サブスクリプション",
      "税金",
      "その他",
    ],
    incomeCategoryList: [
      "利子所得",
      "配当所得",
      "不動産所得",
      "事業所得",
      "給与所得",
      "退職所得",
      "山林所得",
      "譲渡所得",
      "一時所得",
      "雑所得",
    ],
    paymentGroupList: [
      {
        groupName: "生活必需品",
        paymentList: [
          {
            id: 1,
            name: "石鹸",
            payment: 10000,
            monthly: 12,
            category: "消耗品",
            group: "生活必需品",
            durationType: "lifetime",
            endDate: "lifetime",
          },
        ],
      },
      {
        groupName: "生活費",
        paymentList: [
          {
            id: 1,
            name: "外食",
            payment: 120000,
            monthly: 12,
            category: "食費",
            group: "生活費",
            durationType: "lifetime",
            endDate: "lifetime",
          },
        ],
      },
      {
        groupName: "その他",
        paymentList: [
          {
            id: 1,
            name: "風邪薬",
            payment: 5000,
            monthly: 12,
            category: "その他",
            group: "その他",
            durationType: "lifetime",
            endDate: "lifetime",
          },
        ],
      },
    ],
    incomeGroupList: [
      {
        groupName: "給与所得",
        incomeList: [
          {
            id: 1,
            name: "給与所得_1月",
            income: 240000,
            monthly: 12,
            category: "給与所得",
            group: "給与所得",
            durationType: "lifetime",
            endDate: "lifetime",
          },
          {
            id: 2,
            name: "給与所得_2月",
            income: 240000,
            monthly: 12,
            category: "給与所得",
            group: "給与所得",
            durationType: "lifetime",
            endDate: "lifetime",
          },
          {
            id: 3,
            name: "給与所得_3月",
            income: 240000,
            monthly: 12,
            category: "給与所得",
            group: "給与所得",
            durationType: "lifetime",
            endDate: "lifetime",
          },
          {
            id: 4,
            name: "給与所得_4月",
            income: 240000,
            monthly: 12,
            category: "給与所得",
            group: "給与所得",
            durationType: "lifetime",
            endDate: "lifetime",
          },
        ],
      },
    ]
  },
];

function AppRoutes() {
  // ユーザ設定
  const [settings, setSettings] = useState({
    mode: "cute",
  });
  // 支出一覧
  const [expenses, setExpenses] = useState(sampleExpenses);
  // 支出グループ
  const [paymentGroupList, setPaymentGroupList] = useState([
    {
      groupName: "生活必需品",
      paymentList: [
        {
          id: 1,
          name: "石鹸",
          payment: 10000,
          monthly: 12,
          category: "消耗品",
          group: "生活必需品",
          durationType: "lifetime",
          endDate: "lifetime",
        },
      ],
    },
    {
      groupName: "生活費",
      paymentList: [
        {
          id: 1,
          name: "外食",
          payment: 120000,
          monthly: 12,
          category: "食費",
          group: "生活費",
          durationType: "lifetime",
          endDate: "lifetime",
        },
      ],
    },
    {
      groupName: "その他",
      paymentList: [
        {
          id: 1,
          name: "風邪薬",
          payment: 5000,
          monthly: 12,
          category: "その他",
          group: "その他",
          durationType: "lifetime",
          endDate: "lifetime",
        },
      ],
    },
  ]);
  // "生活必需品", "生活費", "その他"
  // 支出カテゴリ
  const [paymentCategoryList, setPaymentCategoryList] = useState([
    "食費",
    "住居費",
    "消耗品",
    "耐久消耗品",
    "水道光熱費",
    "通信費",
    "趣味・旅行・交際費",
    "保険",
    "サブスクリプション",
    "税金",
    "その他",
  ]);
  // サイドバー
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex" }}>
        <Header mode={settings.mode} onMenuClick={handleMenuClick} />
        <Sidebar
          mode={settings.mode}
          open={sidebarOpen}
          onClose={handleSidebarClose}
        />

        {/* メインコンテンツ */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: "100%",
            mt: "64px", // ヘッダーの高さ分のマージン
          }}
        >
          <Routes>
            {/* ホーム画面 */}
            <Route path={`/`} element={<HomePage mode={settings.mode} />} />
            <Route
              path={`${BASE_PATH}/`}
              element={<HomePage mode={settings.mode} />}
            />

            {/* ライフプラン関連 */}
            <Route
              path={`${BASE_PATH}/create-life-plan`}
              element={<LifePlanCreatePage />}
            />

            {/* 支出関連 */}
            <Route
              path={`${BASE_PATH}/:lifeplanId/expenses/:year`}
              element={
                <ExpensesPage
                  paymentCategoryList={paymentCategoryList}
                  paymentGroupList={paymentGroupList}
                  expenses={expenses}
                  setExpenses={setExpenses}
                  mode={settings.mode}
                />
              }
            />

            {/* 収入関連 */}
            <Route
              path={`${BASE_PATH}/income-input`}
              element={<IncomeInputPage />}
            />
            <Route
              path={`${BASE_PATH}/income-input/salary`}
              element={<SalaryInputPage />}
            />

            {/* NotFoundページ - 必ず最後に配置 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default AppRoutes;
