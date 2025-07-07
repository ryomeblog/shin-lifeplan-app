// ローカルストレージからデータを読み込み
const loadData = () => {
  try {
    const data = localStorage.getItem('lifePlanData');
    return data ? JSON.parse(data) : { lifeplan: [] };
  } catch (error) {
    console.error('Failed to load data:', error);
    return { lifeplan: [] };
  }
};

// ローカルストレージにデータを保存
const saveData = (data) => {
  try {
    localStorage.setItem('lifePlanData', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
  }
};

// アクティブなライフプランIDを取得
export const getActiveLifePlanId = () => {
  try {
    return localStorage.getItem('activeLifePlan') || '';
  } catch (error) {
    console.error('Failed to get active life plan ID:', error);
    return '';
  }
};

// アクティブなライフプランIDを設定
export const setActiveLifePlanId = (planId) => {
  try {
    localStorage.setItem('activeLifePlan', planId);
    return true;
  } catch (error) {
    console.error('Failed to set active life plan ID:', error);
    return false;
  }
};

// アクティブなライフプランを取得
export const getActiveLifePlan = () => {
  try {
    const data = loadData();
    const activeId = getActiveLifePlanId();

    if (!Array.isArray(data.lifeplan)) {
      return null;
    }

    return data.lifeplan.find((plan) => plan.id === activeId) || null;
  } catch (error) {
    console.error('Failed to get active life plan:', error);
    return null;
  }
};

// ライフプラン一覧を取得
export const getLifePlans = () => {
  try {
    const data = loadData();
    return Array.isArray(data.lifeplan) ? data.lifeplan : [];
  } catch (error) {
    console.error('Failed to get life plans:', error);
    return [];
  }
};

// ライフプランを保存
export const saveLifePlan = (lifePlanData) => {
  try {
    const data = loadData();
    let existingPlans = data.lifeplan;

    // 既存データが配列でない場合は空配列で初期化
    if (!Array.isArray(existingPlans)) {
      existingPlans = [];
    }

    const existingIndex = existingPlans.findIndex((p) => p.id === lifePlanData.id);

    if (existingIndex >= 0) {
      // 既存のプランを更新
      existingPlans[existingIndex] = lifePlanData;
    } else {
      // 新しいプランを追加
      existingPlans.push(lifePlanData);
    }

    data.lifeplan = existingPlans;
    return saveData(data);
  } catch (error) {
    console.error('Failed to save life plan:', error);
    return false;
  }
};

// ライフプランを更新
export const updateLifePlan = (lifePlanData) => {
  return saveLifePlan(lifePlanData);
};

// ライフプランを削除
export const deleteLifePlan = (planId) => {
  try {
    const data = loadData();
    let existingPlans = data.lifeplan;

    // 既存データが配列でない場合は空配列で初期化
    if (!Array.isArray(existingPlans)) {
      existingPlans = [];
    }

    // 削除対象のプランがアクティブプランの場合、アクティブプランをクリア
    const activeLifePlanId = getActiveLifePlanId();
    if (activeLifePlanId === planId) {
      localStorage.removeItem('activeLifePlan');
    }

    const updatedPlans = existingPlans.filter((p) => p.id !== planId);
    data.lifeplan = updatedPlans;
    return saveData(data);
  } catch (error) {
    console.error('Failed to delete life plan:', error);
    return false;
  }
};

// ライフプラン設定を取得
export const getLifePlanSettings = () => {
  try {
    const activeLifePlan = getActiveLifePlan();
    return (
      activeLifePlan?.settings || {
        currency: 'JPY',
        planStartYear: 2020,
        planEndYear: 2065,
        fireSettings: {
          targetAmount: 0,
          isEnabled: false,
        },
        displaySettings: {
          dateFormat: 'YYYY-MM-DD',
          numberFormat: 'comma',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get life plan settings:', error);
    return {
      currency: 'JPY',
      planStartYear: 2020,
      planEndYear: 2065,
      fireSettings: {
        targetAmount: 0,
        isEnabled: false,
      },
      displaySettings: {
        dateFormat: 'YYYY-MM-DD',
        numberFormat: 'comma',
      },
    };
  }
};

// カテゴリ一覧を取得
export const getCategories = () => {
  try {
    const activeLifePlan = getActiveLifePlan();
    return activeLifePlan?.categories || [];
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
};

// カテゴリを保存
export const saveCategories = (categories) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const updatedPlan = {
      ...activeLifePlan,
      categories: categories,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save categories:', error);
    return false;
  }
};

// 口座一覧を取得
export const getAccounts = () => {
  try {
    const activeLifePlan = getActiveLifePlan();
    return activeLifePlan?.accounts || [];
  } catch (error) {
    console.error('Failed to get accounts:', error);
    return [];
  }
};

// 口座を保存
export const saveAccounts = (accounts) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const updatedPlan = {
      ...activeLifePlan,
      accounts: accounts,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save accounts:', error);
    return false;
  }
};

// 単一口座を保存（追加）
export const saveAccount = (account) => {
  try {
    const accounts = getAccounts();
    const existingIndex = accounts.findIndex((a) => a.id === account.id);

    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }

    return saveAccounts(accounts);
  } catch (error) {
    console.error('Failed to save account:', error);
    return false;
  }
};

// 口座を削除（関連取引も削除）
export const deleteAccount = (accountId) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    // 口座を削除
    const accounts = getAccounts();
    const updatedAccounts = accounts.filter((account) => account.id !== accountId);

    // yearlyDataから該当口座に関連する取引を削除
    const yearlyData = activeLifePlan.yearlyData || [];
    const updatedYearlyData = yearlyData.map((yearData) => {
      const filteredTransactions = (yearData.transactions || []).filter((transaction) => {
        // 支出、収入、振替取引で該当口座が関連する取引を除外
        return !(
          transaction.toAccountId === accountId ||
          transaction.fromAccountId === accountId ||
          (transaction.type === 'expense' && transaction.toAccountId === accountId) ||
          (transaction.type === 'income' && transaction.toAccountId === accountId)
        );
      });

      return {
        ...yearData,
        transactions: filteredTransactions,
      };
    });

    const updatedPlan = {
      ...activeLifePlan,
      accounts: updatedAccounts,
      yearlyData: updatedYearlyData,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to delete account:', error);
    return false;
  }
};

// 口座の現在残高を計算（yearlyDataの取引履歴を考慮）
export const calculateAccountBalance = (accountId, targetYear = null) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      return 0;
    }

    const accounts = activeLifePlan.accounts || [];
    const account = accounts.find((acc) => acc.id === accountId);
    if (!account) {
      return 0;
    }

    let balance = account.initialBalance;
    const yearlyData = activeLifePlan.yearlyData || [];

    // 指定年まで、または全年の取引を適用
    const endYear = targetYear || new Date().getFullYear();

    for (const yearData of yearlyData) {
      if (yearData.year > endYear) break;

      const transactions = yearData.transactions || [];

      for (const transaction of transactions) {
        const amount = transaction.amount || 0;
        const frequency = transaction.frequency || 1;
        const totalAmount = amount * frequency;

        // 取引タイプごとの残高への影響を計算
        if (transaction.type === 'expense' && transaction.toAccountId === accountId) {
          // 支出：該当口座から出金
          balance -= Math.abs(totalAmount);
        } else if (transaction.type === 'income' && transaction.toAccountId === accountId) {
          // 収入：該当口座に入金
          balance += Math.abs(totalAmount);
        } else if (transaction.type === 'transfer') {
          // 振替
          if (transaction.fromAccountId === accountId) {
            // 送金元：出金
            balance -= Math.abs(totalAmount);
          } else if (transaction.toAccountId === accountId) {
            // 送金先：入金
            balance += Math.abs(totalAmount);
          }
        }
        // 投資は口座残高に直接影響しないものとする
      }
    }

    return balance;
  } catch (error) {
    console.error('Failed to calculate account balance:', error);
    return 0;
  }
};

// 資産情報一覧を取得
export const getAssetInfo = () => {
  try {
    const activeLifePlan = getActiveLifePlan();
    return activeLifePlan?.assetInfo || [];
  } catch (error) {
    console.error('Failed to get asset info:', error);
    return [];
  }
};

// 資産情報を保存
export const saveAssetInfo = (assetInfo) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const updatedPlan = {
      ...activeLifePlan,
      assetInfo: assetInfo,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save asset info:', error);
    return false;
  }
};

// IDで資産を取得（追加）
export const getAssetById = (assetId) => {
  try {
    const assets = getAssetInfo();
    return assets.find((asset) => asset.id === assetId) || null;
  } catch (error) {
    console.error('Failed to get asset by ID:', error);
    return null;
  }
};

// 単一資産を保存（追加）
export const saveAsset = (asset) => {
  try {
    const assets = getAssetInfo();
    const existingIndex = assets.findIndex((a) => a.id === asset.id);

    if (existingIndex >= 0) {
      assets[existingIndex] = asset;
    } else {
      assets.push(asset);
    }

    return saveAssetInfo(assets);
  } catch (error) {
    console.error('Failed to save asset:', error);
    return false;
  }
};

// 資産を削除（追加）
export const deleteAsset = (assetId) => {
  try {
    const assets = getAssetInfo();
    const updatedAssets = assets.filter((asset) => asset.id !== assetId);
    return saveAssetInfo(updatedAssets);
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return false;
  }
};

// 保有資産一覧を取得
export const getHoldingAssets = () => {
  try {
    const activeLifePlan = getActiveLifePlan();
    return activeLifePlan?.holdingAssets || [];
  } catch (error) {
    console.error('Failed to get holding assets:', error);
    return [];
  }
};

// 保有資産を保存
export const saveHoldingAssets = (holdingAssets) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const updatedPlan = {
      ...activeLifePlan,
      holdingAssets: holdingAssets,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save holding assets:', error);
    return false;
  }
};

// 家族メンバー一覧を取得
export const getFamilyMembers = () => {
  try {
    const activeLifePlan = getActiveLifePlan();
    return activeLifePlan?.familyMembers || [];
  } catch (error) {
    console.error('Failed to get family members:', error);
    return [];
  }
};

// 家族メンバーを保存
export const saveFamilyMembers = (familyMembers) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const updatedPlan = {
      ...activeLifePlan,
      familyMembers: familyMembers,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save family members:', error);
    return false;
  }
};

// 取引一覧を取得（yearlyDataから）
export const getTransactions = (year = null) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    const yearlyData = activeLifePlan?.yearlyData || [];

    if (year) {
      // 指定年の取引のみを取得
      const yearData = yearlyData.find((yd) => yd.year === year);
      return yearData?.transactions || [];
    }

    // 全年の取引を結合
    return yearlyData.reduce((allTransactions, yearData) => {
      return allTransactions.concat(yearData.transactions || []);
    }, []);
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return [];
  }
};

// 取引を保存（yearlyDataに）
export const saveTransaction = (transaction) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const yearlyData = activeLifePlan.yearlyData || [];

    // 該当年のデータを取得または作成
    let yearData = yearlyData.find((yd) => yd.year === transaction.year);
    if (!yearData) {
      yearData = {
        year: transaction.year,
        transactions: [],
        events: [],
      };
      yearlyData.push(yearData);
    }

    // 取引を追加
    yearData.transactions = yearData.transactions || [];
    yearData.transactions.push(transaction);

    const updatedPlan = {
      ...activeLifePlan,
      yearlyData: yearlyData,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save transaction:', error);
    return false;
  }
};

// 年間データを取得
export const getYearlyData = () => {
  try {
    const activeLifePlan = getActiveLifePlan();
    return activeLifePlan?.yearlyData || [];
  } catch (error) {
    console.error('Failed to get yearly data:', error);
    return [];
  }
};

// 特定年の年間データを取得
export const getYearlyDataByYear = (year) => {
  try {
    const yearlyData = getYearlyData();
    const yearData = yearlyData.find((yd) => yd.year === year);
    return (
      yearData || {
        year: year,
        transactions: [],
        events: [],
      }
    );
  } catch (error) {
    console.error('Failed to get yearly data by year:', error);
    return {
      year: year,
      transactions: [],
      events: [],
    };
  }
};

// 年間データを保存
export const saveYearlyData = (yearlyData) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const updatedPlan = {
      ...activeLifePlan,
      yearlyData: yearlyData,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save yearly data:', error);
    return false;
  }
};

// 特定年の年間データを保存
export const saveYearlyDataByYear = (year, yearData) => {
  try {
    const yearlyData = getYearlyData();
    const existingIndex = yearlyData.findIndex((yd) => yd.year === year);

    if (existingIndex >= 0) {
      yearlyData[existingIndex] = { ...yearData, year };
    } else {
      yearlyData.push({ ...yearData, year });
    }

    return saveYearlyData(yearlyData);
  } catch (error) {
    console.error('Failed to save yearly data by year:', error);
    return false;
  }
};

// 取引を更新
export const updateTransaction = (transaction) => {
  try {
    const yearlyData = getYearlyData();
    const yearData = yearlyData.find((yd) => yd.year === transaction.year);

    if (!yearData || !yearData.transactions) {
      throw new Error('Year data or transactions not found');
    }

    const transactionIndex = yearData.transactions.findIndex((t) => t.id === transaction.id);
    if (transactionIndex >= 0) {
      yearData.transactions[transactionIndex] = transaction;
      return saveYearlyData(yearlyData);
    } else {
      throw new Error('Transaction not found');
    }
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return false;
  }
};

// 取引を削除
export const deleteTransaction = (transactionId, year) => {
  try {
    const yearlyData = getYearlyData();
    const yearData = yearlyData.find((yd) => yd.year === year);

    if (!yearData || !yearData.transactions) {
      throw new Error('Year data or transactions not found');
    }

    yearData.transactions = yearData.transactions.filter((t) => t.id !== transactionId);
    return saveYearlyData(yearlyData);
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return false;
  }
};

// イベント一覧を取得（年単位）
export const getEvents = (year = null) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    const yearlyData = activeLifePlan?.yearlyData || [];

    if (year) {
      // 指定年のイベントのみを取得
      const yearData = yearlyData.find((yd) => yd.year === year);
      return yearData?.events || [];
    }

    // 全年のイベントを結合
    return yearlyData.reduce((allEvents, yearData) => {
      return allEvents.concat(yearData.events || []);
    }, []);
  } catch (error) {
    console.error('Failed to get events:', error);
    return [];
  }
};

// イベントを保存（yearlyDataに）
export const saveEvent = (event) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const yearlyData = activeLifePlan.yearlyData || [];

    // 該当年のデータを取得または作成
    let yearData = yearlyData.find((yd) => yd.year === event.year);
    if (!yearData) {
      yearData = {
        year: event.year,
        transactions: [],
        events: [],
      };
      yearlyData.push(yearData);
    }

    // イベントを追加
    yearData.events = yearData.events || [];

    // 新規作成か更新かを判定
    const existingIndex = yearData.events.findIndex((e) => e.id === event.id);
    if (existingIndex >= 0) {
      yearData.events[existingIndex] = event;
    } else {
      yearData.events.push(event);
    }

    const updatedPlan = {
      ...activeLifePlan,
      yearlyData: yearlyData,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save event:', error);
    return false;
  }
};

// イベントを削除
export const deleteEvent = (eventId, year) => {
  try {
    const yearlyData = getYearlyData();
    const yearData = yearlyData.find((yd) => yd.year === year);

    if (!yearData || !yearData.events) {
      throw new Error('Year data or events not found');
    }

    yearData.events = yearData.events.filter((e) => e.id !== eventId);
    return saveYearlyData(yearlyData);
  } catch (error) {
    console.error('Failed to delete event:', error);
    return false;
  }
};

// イベントを更新
export const updateEvent = (event) => {
  try {
    const yearlyData = getYearlyData();
    const yearData = yearlyData.find((yd) => yd.year === event.year);

    if (!yearData || !yearData.events) {
      throw new Error('Year data or events not found');
    }

    const eventIndex = yearData.events.findIndex((e) => e.id === event.id);
    if (eventIndex >= 0) {
      yearData.events[eventIndex] = event;
      return saveYearlyData(yearlyData);
    } else {
      throw new Error('Event not found');
    }
  } catch (error) {
    console.error('Failed to update event:', error);
    return false;
  }
};

// イベントに取引を追加
export const addTransactionToEvent = (eventId, transactionId, year) => {
  try {
    const events = getEvents(year);
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // 既に追加されていない場合のみ追加
    if (!event.transactionIds.includes(transactionId)) {
      event.transactionIds.push(transactionId);
      return updateEvent(event);
    }

    return true;
  } catch (error) {
    console.error('Failed to add transaction to event:', error);
    return false;
  }
};

// イベントから取引を削除
export const removeTransactionFromEvent = (eventId, transactionId, year) => {
  try {
    const events = getEvents(year);
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.transactionIds = event.transactionIds.filter((id) => id !== transactionId);
    return updateEvent(event);
  } catch (error) {
    console.error('Failed to remove transaction from event:', error);
    return false;
  }
};

// テンプレート一覧を取得
export const getTemplates = (type = null) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    const templates = activeLifePlan?.templates || [];

    if (type) {
      return templates.filter((template) => template.type === type);
    }

    return templates;
  } catch (error) {
    console.error('Failed to get templates:', error);
    return [];
  }
};

// テンプレートを保存
export const saveTemplate = (template) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const templates = activeLifePlan.templates || [];
    const updatedTemplates = [...templates, template];

    const updatedPlan = {
      ...activeLifePlan,
      templates: updatedTemplates,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to save template:', error);
    return false;
  }
};

// テンプレートを更新
export const updateTemplate = (template) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const templates = activeLifePlan.templates || [];
    const templateIndex = templates.findIndex((t) => t.id === template.id);

    if (templateIndex >= 0) {
      templates[templateIndex] = template;
    } else {
      throw new Error('Template not found');
    }

    const updatedPlan = {
      ...activeLifePlan,
      templates: templates,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to update template:', error);
    return false;
  }
};

// テンプレートを削除
export const deleteTemplate = (templateId) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const templates = activeLifePlan.templates || [];
    const updatedTemplates = templates.filter((t) => t.id !== templateId);

    const updatedPlan = {
      ...activeLifePlan,
      templates: updatedTemplates,
      updatedAt: new Date().toISOString(),
    };

    return saveLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to delete template:', error);
    return false;
  }
};

// テンプレート内取引を保存
export const saveTemplateTransaction = (templateId, transaction) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const templates = activeLifePlan.templates || [];
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    if (!template.transactions) {
      template.transactions = [];
    }

    template.transactions.push(transaction);
    template.updatedAt = new Date().toISOString();

    return updateTemplate(template);
  } catch (error) {
    console.error('Failed to save template transaction:', error);
    return false;
  }
};

// テンプレート内取引を更新
export const updateTemplateTransaction = (templateId, transaction) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const templates = activeLifePlan.templates || [];
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    if (!template.transactions) {
      template.transactions = [];
    }

    const transactionIndex = template.transactions.findIndex((t) => t.id === transaction.id);
    if (transactionIndex >= 0) {
      template.transactions[transactionIndex] = transaction;
      template.updatedAt = new Date().toISOString();
      return updateTemplate(template);
    } else {
      throw new Error('Template transaction not found');
    }
  } catch (error) {
    console.error('Failed to update template transaction:', error);
    return false;
  }
};

// テンプレート内取引を削除
export const deleteTemplateTransaction = (templateId, transactionId) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      throw new Error('No active life plan found');
    }

    const templates = activeLifePlan.templates || [];
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    if (!template.transactions) {
      template.transactions = [];
    }

    template.transactions = template.transactions.filter((t) => t.id !== transactionId);
    template.updatedAt = new Date().toISOString();

    return updateTemplate(template);
  } catch (error) {
    console.error('Failed to delete template transaction:', error);
    return false;
  }
};

// データエクスポート
export const exportData = () => {
  try {
    const data = loadData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeplan_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Failed to export data:', error);
    return false;
  }
};

// データインポート
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          const success = saveData(importedData);
          if (success) {
            resolve(true);
          } else {
            reject(new Error('Failed to save imported data'));
          }
        } catch (parseError) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
};
