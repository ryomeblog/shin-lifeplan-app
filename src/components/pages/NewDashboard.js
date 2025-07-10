import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import {
  getActiveLifePlan,
  getCategories,
  getAccounts,
  getAssetInfo,
  getTemplates,
  getTransactions,
  getEvents,
  getLifePlanSettings,
} from '../../utils/storage';

const NewDashboard = () => {
  const [categoryTab, setCategoryTab] = useState('expenses'); // expenses or income
  const [templateTab, setTemplateTab] = useState('expenses'); // expenses, income, investment
  const [dashboardData, setDashboardData] = useState({
    categories: { expenses: [], income: [] },
    accounts: [],
    assets: [],
    templates: [],
    events: [],
    familyMembers: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      const plan = getActiveLifePlan();
      const settings = getLifePlanSettings();

      if (!plan) {
        // プランがない場合は初期値のまま
        return;
      }

      // カテゴリ一覧の計算（全期間の支出・収入合計でトップ3）
      const categories = getCategories();
      const categoryTotals = calculateCategoryTotals(categories, settings);

      // 口座一覧の計算（全期間で残高が高いトップ3）
      const accounts = getAccounts();
      const accountBalances = calculateAccountBalances(accounts, settings);

      // 保有資産の計算（実現損益が高いトップ3）
      const assets = getAssetInfo();
      const assetPerformance = calculateAssetPerformance(assets, settings);

      // テンプレート一覧
      const templates = getTemplates();

      // イベント一覧（費用が高いトップ3）
      const events = calculateEventCosts(settings);

      // 家族メンバー
      const familyMembers = plan.familyMembers || [];

      setDashboardData({
        categories: categoryTotals,
        accounts: accountBalances,
        assets: assetPerformance,
        templates: templates,
        events: events,
        familyMembers: familyMembers,
      });
    } catch (error) {
      console.error('ダッシュボードデータ読み込みエラー:', error);
      // エラー時も初期値を設定
      setDashboardData({
        categories: { expenses: [], income: [] },
        accounts: [],
        assets: [],
        templates: [],
        events: [],
        familyMembers: [],
      });
    }
  };

  // カテゴリ合計を計算
  const calculateCategoryTotals = (categories, settings) => {
    const categoryTotals = new Map();

    // 全期間の取引を集計
    for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
      const transactions = getTransactions(year);

      transactions.forEach((transaction) => {
        const categoryId = transaction.categoryId;
        const category = categories.find((c) => c.id === categoryId);

        if (category) {
          const amount = Math.abs(transaction.amount || 0) * (transaction.frequency || 1);
          const current = categoryTotals.get(categoryId) || {
            name: category.name,
            type: category.type,
            total: 0,
          };
          current.total += amount;
          categoryTotals.set(categoryId, current);
        }
      });
    }

    // タイプ別にソートしてトップ3を取得
    const expenseCategories = Array.from(categoryTotals.values())
      .filter((cat) => cat.type === 'expense')
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((cat) => ({ name: cat.name, amount: -cat.total }));

    const incomeCategories = Array.from(categoryTotals.values())
      .filter((cat) => cat.type === 'income')
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((cat) => ({ name: cat.name, amount: cat.total }));

    return { expenses: expenseCategories, income: incomeCategories };
  };

  // 口座残高を計算
  const calculateAccountBalances = (accounts, settings) => {
    if (!accounts || accounts.length === 0) {
      return [];
    }

    const accountBalances = accounts.map((account) => {
      let balance = account.initialBalance || 0;

      // 全期間の取引を適用
      for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
        const transactions = getTransactions(year);

        transactions.forEach((transaction) => {
          const amount = Math.abs(transaction.amount || 0) * (transaction.frequency || 1);

          if (transaction.type === 'expense' && transaction.toAccountId === account.id) {
            balance -= amount;
          } else if (transaction.type === 'income' && transaction.toAccountId === account.id) {
            balance += amount;
          } else if (transaction.type === 'investment') {
            if (
              transaction.fromAccountId === account.id &&
              transaction.transactionSubtype === 'buy'
            ) {
              balance -= amount; // 投資買付は支出
            } else if (
              transaction.toAccountId === account.id &&
              (transaction.transactionSubtype === 'dividend' ||
                transaction.transactionSubtype === 'sell')
            ) {
              balance += amount; // 配当と売却は収入
            }
          } else if (transaction.type === 'transfer') {
            if (transaction.fromAccountId === account.id) {
              balance -= amount;
            } else if (transaction.toAccountId === account.id) {
              balance += amount;
            }
          }
        });
      }

      return { name: account.name, amount: balance };
    });

    return accountBalances.sort((a, b) => b.amount - a.amount).slice(0, 3);
  };

  // 資産パフォーマンスを計算
  const calculateAssetPerformance = (assets, settings) => {
    if (!assets || assets.length === 0) {
      return [];
    }

    const assetPerformance = assets.map((asset) => {
      let totalRealized = 0;

      // 全期間の投資取引から実現損益を計算
      for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
        const transactions = getTransactions(year);

        transactions.forEach((transaction) => {
          if (
            transaction.type === 'investment' &&
            transaction.holdingAssetId === asset.id &&
            transaction.transactionSubtype === 'sell'
          ) {
            const amount = Math.abs(transaction.amount || 0) * (transaction.frequency || 1);
            totalRealized += amount;
          }
        });
      }

      return { name: asset.name, amount: totalRealized };
    });

    return assetPerformance.sort((a, b) => b.amount - a.amount).slice(0, 3);
  };

  // イベント費用を計算
  const calculateEventCosts = (settings) => {
    const eventCosts = new Map();

    // 全期間のイベントを集計
    for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
      const events = getEvents(year);

      events.forEach((event) => {
        const transactions = getTransactions(year).filter(
          (t) => event.transactionIds && event.transactionIds.includes(t.id)
        );

        const totalCost = transactions.reduce((sum, transaction) => {
          if (transaction.type === 'expense') {
            return sum + Math.abs(transaction.amount || 0) * (transaction.frequency || 1);
          }
          return sum;
        }, 0);

        if (totalCost > 0) {
          eventCosts.set(event.id, { name: event.name, amount: totalCost });
        }
      });
    }

    return Array.from(eventCosts.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getCurrentCategories = () => {
    if (!dashboardData.categories) {
      return [];
    }
    return categoryTab === 'expenses'
      ? dashboardData.categories.expenses || []
      : dashboardData.categories.income || [];
  };

  const getCurrentTemplates = () => {
    const templates = dashboardData.templates || [];
    switch (templateTab) {
      case 'income':
        return templates.filter((t) => t.type === 'income').slice(0, 3);
      case 'investment':
        return templates.filter((t) => t.type === 'investment').slice(0, 3);
      default:
        return templates.filter((t) => t.type === 'expense').slice(0, 3);
    }
  };

  // 寿命を計算
  const calculateLifeExpectancy = (member) => {
    return member.lifeExpectancy || (member.gender === 'female' ? 87 : 81);
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
              {getCurrentCategories().length > 0 ? (
                getCurrentCategories().map((category, index) => (
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
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">データがありません</div>
              )}
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
              {dashboardData.accounts && dashboardData.accounts.length > 0 ? (
                dashboardData.accounts.map((account, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-900">{account.name}</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(account.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">データがありません</div>
              )}
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
              {dashboardData.assets && dashboardData.assets.length > 0 ? (
                dashboardData.assets.map((asset, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-900">{asset.name}</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(asset.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">データがありません</div>
              )}
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
              {getCurrentTemplates().length > 0 ? (
                getCurrentTemplates().map((template, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-900">{template.name}</span>
                    <span className="font-semibold text-blue-600">テンプレート</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">データがありません</div>
              )}
            </div>
          </Card>
        </div>

        {/* イベント一覧と家族管理 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* イベント一覧 */}
          <Card
            title={
              <Link to="/events" className="text-blue-600 hover:text-blue-800">
                イベント一覧
              </Link>
            }
          >
            <div className="space-y-2">
              {dashboardData.events && dashboardData.events.length > 0 ? (
                dashboardData.events.map((event, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-900">{event.name}</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(event.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">データがありません</div>
              )}
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
              {dashboardData.familyMembers && dashboardData.familyMembers.length > 0 ? (
                dashboardData.familyMembers.map((member, index) => {
                  const lifeExpectancy = calculateLifeExpectancy(member);
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900">{member.name}</span>
                      <span className="text-sm text-gray-600">寿命 {lifeExpectancy}歳</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">データがありません</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;
