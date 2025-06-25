// ローカルストレージのキー
const STORAGE_KEY = 'lifeplan_data';

// デフォルトデータ構造
const getDefaultData = () => ({
  metadata: {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastBackup: new Date().toISOString(),
  },
  lifeplan: [
    {
      id: 'lp_001',
      name: 'マイライフプラン',
      settings: {
        currency: 'JPY',
        planStartYear: 2025,
        planEndYear: 2065,
        fireSettings: {
          targetAmount: 50000000,
          isEnabled: true,
        },
        displaySettings: {
          dateFormat: 'YYYY-MM-DD',
          numberFormat: 'comma',
        },
      },
      familyMembers: [],
      accounts: [],
      categories: [],
      assetInfo: [
        {
          id: 'ai_001',
          name: '日本株式インデックス',
          symbol: 'JP001',
          description: 'インデックス投資信託',
          currency: 'JPY',
          priceHistory: [
            { year: 2025, price: 25000 },
            { year: 2030, price: 28000 },
            { year: 2035, price: 32000 },
            { year: 2040, price: 35000 },
            { year: 2045, price: 38000 },
            { year: 2050, price: 42000 },
          ],
          dividendHistory: [
            { year: 2025, dividendPerShare: 500 },
            { year: 2030, dividendPerShare: 600 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'ai_002',
          name: '米国株式インデックス',
          symbol: 'US001',
          description: 'S&P500連動ETF',
          currency: 'JPY',
          priceHistory: [
            { year: 2025, price: 15000 },
            { year: 2030, price: 16000 },
            { year: 2035, price: 18000 },
            { year: 2040, price: 20000 },
            { year: 2045, price: 22000 },
            { year: 2050, price: 25000 },
          ],
          dividendHistory: [
            { year: 2025, dividendPerShare: 300 },
            { year: 2030, dividendPerShare: 350 },
          ],
          createdAt: new Date().toISOString(),
        },
      ],
      holdingAssets: [
        {
          id: 'ha_001',
          assetId: 'ai_001',
          quantity: 100,
          purchaseYear: 2025,
          sellYear: null,
          accountId: 'acc_001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'ha_002',
          assetId: 'ai_002',
          quantity: 200,
          purchaseYear: 2025,
          sellYear: null,
          accountId: 'acc_002',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      templates: [],
      yearlyData: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
});

/**
 * ローカルストレージからデータを読み込む
 */
export const loadData = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // データ構造の検証とマージ
      return mergeWithDefaults(parsedData);
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }

  // データが存在しないか読み込みに失敗した場合はデフォルトデータを返す
  const defaultData = getDefaultData();
  saveData(defaultData);
  return defaultData;
};

/**
 * ローカルストレージにデータを保存する
 */
export const saveData = (data) => {
  try {
    const dataToSave = {
      ...data,
      metadata: {
        ...data.metadata,
        lastBackup: new Date().toISOString(),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
    return false;
  }
};

/**
 * デフォルトデータとマージして不足部分を補完
 */
const mergeWithDefaults = (storedData) => {
  const defaultData = getDefaultData();

  // ライフプランデータの構造チェックと移行
  let lifeplans = storedData.lifeplan || [];

  // 古い構造からの移行処理
  if (storedData.familyMembers || storedData.accounts || storedData.categories) {
    console.log('Migrating old data structure to new format...');

    // 既存のライフプランがある場合は更新、ない場合は新規作成
    if (lifeplans.length > 0) {
      lifeplans = lifeplans.map((plan) => ({
        ...defaultData.lifeplan[0],
        ...plan,
        familyMembers: storedData.familyMembers || plan.familyMembers || [],
        accounts: storedData.accounts || plan.accounts || [],
        categories: storedData.categories || plan.categories || [],
        assetInfo: storedData.assetInfo || plan.assetInfo || defaultData.lifeplan[0].assetInfo,
        holdingAssets: storedData.holdingAssets || plan.holdingAssets || [],
        templates: storedData.templates || plan.templates || [],
        yearlyData: storedData.yearlyData || plan.yearlyData || [],
      }));
    } else {
      // 新しいライフプランを作成
      lifeplans = [
        {
          ...defaultData.lifeplan[0],
          familyMembers: storedData.familyMembers || [],
          accounts: storedData.accounts || [],
          categories: storedData.categories || [],
          assetInfo: storedData.assetInfo || defaultData.lifeplan[0].assetInfo,
          holdingAssets: storedData.holdingAssets || [],
          templates: storedData.templates || [],
          yearlyData: storedData.yearlyData || [],
        },
      ];
    }
  }

  return {
    metadata: { ...defaultData.metadata, ...storedData.metadata },
    lifeplan: lifeplans.length > 0 ? lifeplans : defaultData.lifeplan,
  };
};

// === ライフプラン管理 ===

/**
 * ライフプランリストを取得
 */
export const getLifePlans = () => {
  const data = loadData();
  const lifeplan = data.lifeplan;

  // 配列でない場合は空配列を返す
  if (!Array.isArray(lifeplan)) {
    return [];
  }

  return lifeplan;
};

/**
 * ライフプランを保存
 */
export const saveLifePlan = (lifePlan) => {
  try {
    const data = loadData();
    let existingPlans = data.lifeplan;

    // 既存データが配列でない場合は空配列で初期化
    if (!Array.isArray(existingPlans)) {
      existingPlans = [];
    }

    const updatedPlans = existingPlans.find((p) => p.id === lifePlan.id)
      ? existingPlans.map((p) => (p.id === lifePlan.id ? lifePlan : p))
      : [...existingPlans, lifePlan];

    data.lifeplan = updatedPlans;
    return saveData(data);
  } catch (error) {
    console.error('Failed to save life plan:', error);
    return false;
  }
};

/**
 * ライフプランを更新
 */
export const updateLifePlan = (lifePlan) => {
  try {
    const data = loadData();
    let existingPlans = data.lifeplan;

    // 既存データが配列でない場合は空配列で初期化
    if (!Array.isArray(existingPlans)) {
      existingPlans = [];
    }

    const updatedPlans = existingPlans.map((p) => (p.id === lifePlan.id ? lifePlan : p));
    data.lifeplan = updatedPlans;
    return saveData(data);
  } catch (error) {
    console.error('Failed to update life plan:', error);
    return false;
  }
};

/**
 * ライフプランを削除
 */
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

/**
 * アクティブなライフプランIDを取得
 */
export const getActiveLifePlanId = () => {
  return localStorage.getItem('activeLifePlan');
};

/**
 * アクティブなライフプランを設定
 */
export const setActiveLifePlanId = (planId) => {
  try {
    localStorage.setItem('activeLifePlan', planId);
    return true;
  } catch (error) {
    console.error('Failed to set active life plan:', error);
    return false;
  }
};

/**
 * アクティブなライフプランを取得
 */
export const getActiveLifePlan = () => {
  try {
    const activePlanId = getActiveLifePlanId();
    const lifePlans = getLifePlans();

    // 配列であることを確認してからfindを実行
    if (Array.isArray(lifePlans)) {
      return lifePlans.find((p) => p.id === activePlanId) || lifePlans[0] || null;
    }

    return null;
  } catch (error) {
    console.error('Failed to get active life plan:', error);
    return null;
  }
};

/**
 * ライフプラン設定を取得
 */
export const getLifePlanSettings = () => {
  const activeLifePlan = getActiveLifePlan();
  return activeLifePlan?.settings || getDefaultData().lifeplan[0].settings;
};

// === カテゴリ管理 ===

/**
 * カテゴリを取得（アクティブなライフプランから）
 */
export const getCategories = () => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    return [];
  }

  // レガシーデータの移行処理
  if (!activeLifePlan.categories) {
    try {
      const legacyCategories = JSON.parse(localStorage.getItem('categories') || '[]');
      if (legacyCategories.length > 0) {
        // レガシーデータをアクティブなライフプランに移行
        const updatedPlan = { ...activeLifePlan, categories: legacyCategories };
        updateLifePlan(updatedPlan);
        return legacyCategories;
      }
    } catch (error) {
      console.error('Failed to migrate legacy categories:', error);
    }
  }

  return activeLifePlan.categories || [];
};

/**
 * カテゴリを保存（アクティブなライフプランに）
 */
export const saveCategories = (categories) => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    console.error('No active life plan found');
    return false;
  }

  const updatedPlan = {
    ...activeLifePlan,
    categories,
    updatedAt: new Date().toISOString(),
  };

  return updateLifePlan(updatedPlan);
};

// === 口座管理 ===

/**
 * 口座を取得（アクティブなライフプランから）
 */
export const getAccounts = () => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    return [];
  }

  // レガシーデータの移行処理
  if (!activeLifePlan.accounts) {
    try {
      const legacyAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      if (legacyAccounts.length > 0) {
        // レガシーデータをアクティブなライフプランに移行
        const updatedPlan = { ...activeLifePlan, accounts: legacyAccounts };
        updateLifePlan(updatedPlan);
        return legacyAccounts;
      }
    } catch (error) {
      console.error('Failed to migrate legacy accounts:', error);
    }
  }

  return activeLifePlan.accounts || [];
};

/**
 * 口座を保存（アクティブなライフプランに）
 */
export const saveAccounts = (accounts) => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    console.error('No active life plan found');
    return false;
  }

  const updatedPlan = {
    ...activeLifePlan,
    accounts,
    updatedAt: new Date().toISOString(),
  };

  return updateLifePlan(updatedPlan);
};

/**
 * 単一の口座を追加または更新
 */
export const saveAccount = (account) => {
  const accounts = getAccounts();
  const existingIndex = accounts.findIndex((a) => a.id === account.id);

  let updatedAccounts;
  if (existingIndex >= 0) {
    // 既存の口座を更新
    updatedAccounts = accounts.map((a, index) =>
      index === existingIndex ? { ...account, updatedAt: new Date().toISOString() } : a
    );
  } else {
    // 新しい口座を追加
    updatedAccounts = [...accounts, { ...account, createdAt: new Date().toISOString() }];
  }

  return saveAccounts(updatedAccounts);
};

// === 家族メンバー管理 ===

/**
 * 家族メンバーを取得（アクティブなライフプランから）
 */
export const getFamilyMembers = () => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    return [];
  }

  return activeLifePlan.familyMembers || [];
};

/**
 * 家族メンバーを保存（アクティブなライフプランに）
 */
export const saveFamilyMembers = (familyMembers) => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    console.error('No active life plan found');
    return false;
  }

  const updatedPlan = {
    ...activeLifePlan,
    familyMembers,
    updatedAt: new Date().toISOString(),
  };

  return updateLifePlan(updatedPlan);
};

// === 資産情報管理 ===

/**
 * 資産情報を取得（アクティブなライフプランから）
 */
export const getAssetInfo = () => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    return [];
  }

  return activeLifePlan.assetInfo || [];
};

/**
 * 特定の資産情報を取得
 */
export const getAssetById = (assetId) => {
  const assetInfo = getAssetInfo();
  return assetInfo.find((asset) => asset.id === assetId);
};

/**
 * 資産情報を保存（アクティブなライフプランに）
 */
export const saveAssetInfo = (assetInfoArray) => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    console.error('No active life plan found');
    return false;
  }

  const updatedPlan = {
    ...activeLifePlan,
    assetInfo: assetInfoArray,
    updatedAt: new Date().toISOString(),
  };

  return updateLifePlan(updatedPlan);
};

/**
 * 単一の資産を追加または更新
 */
export const saveAsset = (asset) => {
  const assetInfo = getAssetInfo();
  const existingIndex = assetInfo.findIndex((a) => a.id === asset.id);

  let updatedAssetInfo;
  if (existingIndex >= 0) {
    // 既存の資産を更新
    updatedAssetInfo = assetInfo.map((a, index) =>
      index === existingIndex ? { ...asset, updatedAt: new Date().toISOString() } : a
    );
  } else {
    // 新しい資産を追加
    updatedAssetInfo = [...assetInfo, { ...asset, createdAt: new Date().toISOString() }];
  }

  return saveAssetInfo(updatedAssetInfo);
};

/**
 * 資産を削除（関連する保有資産と取引も削除）
 */
export const deleteAsset = (assetId) => {
  try {
    const activeLifePlan = getActiveLifePlan();
    if (!activeLifePlan) {
      console.error('No active life plan found');
      return false;
    }

    // 資産情報から削除
    const updatedAssetInfo = activeLifePlan.assetInfo.filter((asset) => asset.id !== assetId);

    // 関連する保有資産を削除
    const updatedHoldingAssets = activeLifePlan.holdingAssets.filter(
      (holding) => holding.assetId !== assetId
    );

    // 関連する取引を削除（年次データから）
    const updatedYearlyData = activeLifePlan.yearlyData.map((yearData) => ({
      ...yearData,
      transactions:
        yearData.transactions?.filter(
          (transaction) =>
            !transaction.holdingAssetId ||
            !updatedHoldingAssets.some(
              (holding) => holding.id === transaction.holdingAssetId && holding.assetId === assetId
            )
        ) || [],
    }));

    const updatedPlan = {
      ...activeLifePlan,
      assetInfo: updatedAssetInfo,
      holdingAssets: updatedHoldingAssets,
      yearlyData: updatedYearlyData,
      updatedAt: new Date().toISOString(),
    };

    return updateLifePlan(updatedPlan);
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return false;
  }
};

// === 保有資産管理 ===

/**
 * 保有資産を取得（アクティブなライフプランから）
 */
export const getHoldingAssets = () => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    return [];
  }

  return activeLifePlan.holdingAssets || [];
};

/**
 * 保有資産を保存（アクティブなライフプランに）
 */
export const saveHoldingAssets = (holdingAssetsArray) => {
  const activeLifePlan = getActiveLifePlan();
  if (!activeLifePlan) {
    console.error('No active life plan found');
    return false;
  }

  const updatedPlan = {
    ...activeLifePlan,
    holdingAssets: holdingAssetsArray,
    updatedAt: new Date().toISOString(),
  };

  return updateLifePlan(updatedPlan);
};

/**
 * データをJSONファイルとしてエクスポート
 */
export const exportData = () => {
  const data = loadData();
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `lifeplan_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

/**
 * JSONファイルからデータをインポート
 */
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const mergedData = mergeWithDefaults(importedData);
        const success = saveData(mergedData);
        if (success) {
          resolve(mergedData);
        } else {
          reject(new Error('Failed to save imported data'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// === レガシーLocalStorageクリーンアップ ===

/**
 * レガシーLocalStorageキーをクリーンアップ
 */
export const cleanupLegacyStorage = () => {
  const legacyKeys = [
    'categories',
    'accounts',
    'lifePlans',
    // 必要に応じて他のキーも追加
  ];

  legacyKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove legacy key ${key}:`, error);
    }
  });
};
