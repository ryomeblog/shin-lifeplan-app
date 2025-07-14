import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../ui/Card';
import TutorialSpotlight from '../layout/TutorialSpotlight';
import {
  getLifePlanSettings,
  getCategories,
  getTransactions,
  getAssetInfo,
  saveLifePlanSettings,
} from '../../utils/storage';

// ダミーグラフコンポーネント
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
  '#8DD1E1',
  '#D084D0',
];
const DUMMY_EXPENSE_DATA = [
  { name: '食費', value: 300000 },
  { name: '住居', value: 200000 },
  { name: '交通', value: 100000 },
];
const DUMMY_INCOME_DATA = [
  { name: '給与', value: 500000 },
  { name: '副業', value: 100000 },
];
const DUMMY_YEARLY_DATA = [
  { year: 2020, income: 500000, expense: 300000 },
  { year: 2021, income: 520000, expense: 310000 },
  { year: 2022, income: 540000, expense: 320000 },
];
const DUMMY_ASSET_DATA = [
  { year: 2020, totalAssetValue: 1000000, dividendAmount: 20000 },
  { year: 2021, totalAssetValue: 1200000, dividendAmount: 25000 },
  { year: 2022, totalAssetValue: 1400000, dividendAmount: 30000 },
];

const DummyExpensePie = () => (
  <div className="h-48 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={DUMMY_EXPENSE_DATA}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={60}
          label={({ name, percent }) =>
            percent < 5 ? '' : `${name} ${(percent * 100).toFixed(1)}%`
          }
        >
          {DUMMY_EXPENSE_DATA.map((entry, index) => (
            <Cell key={`expense-cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const DummyIncomePie = () => (
  <div className="h-48 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={DUMMY_INCOME_DATA}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={60}
          label={({ name, percent }) =>
            percent < 5 ? '' : `${name} ${(percent * 100).toFixed(1)}%`
          }
        >
          {DUMMY_INCOME_DATA.map((entry, index) => (
            <Cell key={`income-cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const DummyYearlyLine = () => (
  <div className="h-48 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={DUMMY_YEARLY_DATA}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#28a745" name="収入" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" stroke="#dc3545" name="支出" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const DummyAssetBar = () => (
  <div className="h-56 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={DUMMY_ASSET_DATA}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalAssetValue" fill="#007bff" name="資産総額" opacity={0.8} />
        <Bar dataKey="dividendAmount" fill="#ffc107" name="配当金" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0); // インデックスベースに変更
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [yearlyIncomeExpenseData, setYearlyIncomeExpenseData] = useState([]);
  const [assetProgressData, setAssetProgressData] = useState([]);

  // チュートリアル用
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [settings, setSettings] = useState(getLifePlanSettings());
  const tabHeaderRef = useRef(null);
  const expensePieRef = useRef(null);
  const incomePieRef = useRef(null);
  const yearlyLineRef = useRef(null);
  const assetBarRef = useRef(null);

  // チュートリアルステップ定義
  const tutorialSteps = [
    {
      key: 'tab-accounts',
      label: '口座タブ',
      desc: '「口座」タブを選択すると、収支やカテゴリごとの割合などを確認できます。',
      targetRef: tabHeaderRef,
      panelSide: 'bottom',
      panelWidth: 340,
      panelHeight: 140,
      tabIndex: 0,
    },
    {
      key: 'expense-pie',
      label: '支出カテゴリ割合グラフ',
      desc: 'ここでは支出カテゴリごとの割合を円グラフで確認できます。',
      targetRef: expensePieRef,
      panelSide: 'right',
      panelWidth: 340,
      panelHeight: 360,
      tabIndex: 0,
      dummyGraphComponent: DummyExpensePie,
    },
    {
      key: 'income-pie',
      label: '収入カテゴリ割合グラフ',
      desc: 'ここでは収入カテゴリごとの割合を円グラフで確認できます。',
      targetRef: incomePieRef,
      panelSide: 'left',
      panelWidth: 340,
      panelHeight: 360,
      tabIndex: 0,
      dummyGraphComponent: DummyIncomePie,
    },
    {
      key: 'yearly-line',
      label: '年間収支推移グラフ',
      desc: 'ここでは年間ごとの収入・支出の推移を折れ線グラフで確認できます。',
      targetRef: yearlyLineRef,
      panelSide: 'right',
      panelWidth: 340,
      panelHeight: 360,
      tabIndex: 0,
      dummyGraphComponent: DummyYearlyLine,
    },
    {
      key: 'tab-assets',
      label: '資産タブ',
      desc: '「資産」タブを選択すると、資産推移や配当金などを確認できます。',
      targetRef: tabHeaderRef,
      panelSide: 'bottom',
      panelWidth: 340,
      panelHeight: 160,
      tabIndex: 1,
    },
    {
      key: 'asset-bar',
      label: '資産推移グラフ',
      desc: 'ここでは資産総額や配当金の推移を棒グラフで確認できます。',
      targetRef: assetBarRef,
      panelSide: 'right',
      panelWidth: 340,
      panelHeight: 400,
      tabIndex: 1,
      dummyGraphComponent: DummyAssetBar,
    },
  ];

  // チュートリアル進行時にタブを自動切り替え
  useEffect(() => {
    if (showTutorial && tutorialSteps[tutorialStep]?.tabIndex !== undefined) {
      setActiveTab(tutorialSteps[tutorialStep].tabIndex);
    }
    // eslint-disable-next-line
  }, [tutorialStep, showTutorial]);

  // チュートリアル終了処理
  const handleTutorialClose = () => {
    if (settings) {
      const newSettings = {
        ...settings,
        tutorialStatus: {
          ...settings.tutorialStatus,
          reports: true,
        },
      };
      saveLifePlanSettings(newSettings);
      setSettings(newSettings);
    }
    setShowTutorial(false);
  };

  // チュートリアル表示制御
  useEffect(() => {
    if (settings && settings.tutorialStatus && settings.tutorialStatus.reports !== true) {
      setShowTutorial(true);
      setTutorialStep(0);
    }
  }, [settings]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // ライフプラン設定を取得
      const settings = getLifePlanSettings();

      // カテゴリを取得
      const categoryData = getCategories();

      // データを計算
      calculateAccountsData(settings, categoryData);
      calculateAssetsData(settings);
    } catch (error) {
      console.error('Failed to load report data:', error);
    }
  };

  // 口座タブのデータを計算
  const calculateAccountsData = (settings, categoryData) => {
    const expenseByCategory = {};
    const incomeByCategory = {};
    const yearlyData = [];

    // 年別データを初期化
    for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
      yearlyData.push({
        year,
        income: 0,
        expense: 0,
      });
    }

    // 全年の取引データを集計
    for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
      const transactions = getTransactions(year);
      const yearDataIndex = yearlyData.findIndex((yd) => yd.year === year);

      transactions.forEach((transaction) => {
        const amount = Math.abs(transaction.amount || 0);
        const frequency = transaction.frequency || 1;
        const totalAmount = amount * frequency;

        // カテゴリ名を取得
        const category = categoryData.find((cat) => cat.id === transaction.categoryId);
        const categoryName = category?.name || 'その他';

        if (transaction.type === 'expense') {
          // 支出の集計
          if (!expenseByCategory[categoryName]) {
            expenseByCategory[categoryName] = 0;
          }
          expenseByCategory[categoryName] += totalAmount;

          // 年別支出に追加
          if (yearDataIndex >= 0) {
            yearlyData[yearDataIndex].expense += totalAmount;
          }
        } else if (transaction.type === 'income') {
          // 収入の集計
          if (!incomeByCategory[categoryName]) {
            incomeByCategory[categoryName] = 0;
          }
          incomeByCategory[categoryName] += totalAmount;

          // 年別収入に追加
          if (yearDataIndex >= 0) {
            yearlyData[yearDataIndex].income += totalAmount;
          }
        } else if (transaction.type === 'investment') {
          // 投資取引の処理
          if (transaction.transactionSubtype === 'buy') {
            // 買付は支出として計算
            if (yearDataIndex >= 0) {
              yearlyData[yearDataIndex].expense += totalAmount;
            }
          } else if (
            transaction.transactionSubtype === 'sell' ||
            transaction.transactionSubtype === 'dividend'
          ) {
            // 売却と配当は収入として計算
            if (yearDataIndex >= 0) {
              yearlyData[yearDataIndex].income += totalAmount;
            }
          }
        }
      });
    }

    // 円グラフ用データを準備
    const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    setExpenseData(expensePieData);
    setIncomeData(incomePieData);
    setYearlyIncomeExpenseData(yearlyData);
  };

  // 資産タブのデータを計算
  const calculateAssetsData = (settings) => {
    const assets = getAssetInfo();
    const yearlyAssetData = [];

    // 年別データを初期化
    for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
      yearlyAssetData.push({
        year,
        totalAssetValue: 0,
        dividendAmount: 0,
      });
    }

    // 各資産の保有状況を追跡
    const assetHoldings = new Map();

    // 全年の投資取引データを処理
    for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
      const transactions = getTransactions(year);
      const yearDataIndex = yearlyAssetData.findIndex((yd) => yd.year === year);

      transactions.forEach((transaction) => {
        if (transaction.type === 'investment' && transaction.holdingAssetId) {
          const assetId = transaction.holdingAssetId;
          const asset = assets.find((a) => a.id === assetId);

          if (!asset) return;

          // 保有状況を初期化
          if (!assetHoldings.has(assetId)) {
            assetHoldings.set(assetId, { quantity: 0 });
          }

          const holding = assetHoldings.get(assetId);
          const quantity = transaction.quantity || 0;
          const amount = Math.abs(transaction.amount || 0);

          if (transaction.transactionSubtype === 'buy') {
            // 買付: 保有数量増加
            holding.quantity += quantity;
          } else if (transaction.transactionSubtype === 'sell') {
            // 売却: 保有数量減少
            holding.quantity -= quantity;
            if (holding.quantity < 0) holding.quantity = 0;
          } else if (transaction.transactionSubtype === 'dividend') {
            // 配当: その年の配当金額に加算
            if (yearDataIndex >= 0) {
              yearlyAssetData[yearDataIndex].dividendAmount += amount;
            }
          }
        }
      });

      // その年の時点での総資産額を計算
      let totalValue = 0;
      assetHoldings.forEach((holding, assetId) => {
        const asset = assets.find((a) => a.id === assetId);
        if (asset && holding.quantity > 0) {
          // その年の評価額を取得
          const priceData = asset.priceHistory?.find((p) => p.year === year);
          if (priceData) {
            totalValue += holding.quantity * priceData.price;
          }
        }
      });

      if (yearDataIndex >= 0) {
        yearlyAssetData[yearDataIndex].totalAssetValue = totalValue;
      }
    }

    setAssetProgressData(yearlyAssetData);
  };

  // 金額フォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Y軸の金額フォーマット
  const formatYAxis = (value) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(0)}億円`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}万円`;
    }
    return `${value.toLocaleString()}円`;
  };

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 円グラフのカスタムラベル
  const renderPieLabel = ({ name, percent }) => {
    if (percent < 5) return ''; // 5%未満は表示しない
    return `${name} ${percent.toFixed(1)}%`;
  };

  // 口座タブのコンテンツ
  const AccountsTabContent = () => (
    <div className="space-y-6">
      {/* 支出・収入円グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 支出カテゴリ割合 */}
        <div ref={expensePieRef}>
          <Card title="支出カテゴリ割合">
            {expenseData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={renderPieLabel}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`expense-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>支出データがありません</p>
              </div>
            )}
          </Card>
        </div>

        {/* 収入カテゴリ割合 */}
        <div ref={incomePieRef}>
          <Card title="収入カテゴリ割合">
            {incomeData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={renderPieLabel}
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`income-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>収入データがありません</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 年間収支推移 */}
      <div
        ref={yearlyLineRef}
        className="w-full h-auto"
        key={`yearly-line-${tutorialStep}-${activeTab}`}
        data-spotlight-no-clone
      >
        <Card title="年間収支推移">
          {yearlyIncomeExpenseData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyIncomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#28a745"
                    name="収入"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#dc3545"
                    name="支出"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>収支データがありません</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  // 資産タブのコンテンツ
  const AssetsTabContent = () => (
    <div className="space-y-6">
      {/* 資産推移 */}
      <div
        ref={assetBarRef}
        className="w-full h-auto"
        key={`asset-bar-${tutorialStep}-${activeTab}`}
        data-spotlight-no-clone
      >
        <Card title="資産推移">
          {assetProgressData.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="totalAssetValue" fill="#007bff" name="資産総額" opacity={0.8} />
                  <Bar dataKey="dividendAmount" fill="#ffc107" name="配当金" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>資産データがありません</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  // タブ設定（contentプロパティ付き）
  const tabs = [
    {
      label: '口座',
      content: <AccountsTabContent />,
    },
    {
      label: '資産',
      content: <AssetsTabContent />,
    },
  ];

  return (
    <TutorialSpotlight
      steps={tutorialSteps}
      step={tutorialStep}
      onNext={() => {
        if (tutorialStep < tutorialSteps.length - 1) {
          setTutorialStep((prev) => prev + 1);
        } else {
          handleTutorialClose();
        }
      }}
      onClose={handleTutorialClose}
      visible={showTutorial}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">レポート・分析</h1>

        {/* タブ切り替えとコンテンツ表示 */}
        <div className="space-y-6">
          {/* タブヘッダー */}
          <div className="flex border-b border-gray-200" ref={tabHeaderRef}>
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-b-2 -mb-px ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* タブコンテンツ */}
          <div className="mt-4">{tabs[activeTab]?.content}</div>
        </div>
      </div>
    </TutorialSpotlight>
  );
};

export default Reports;
