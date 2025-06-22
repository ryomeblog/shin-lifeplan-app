// ローカルストレージのキー
const STORAGE_KEY = 'lifeplan_data';

// デフォルトデータ構造
const getDefaultData = () => ({
  metadata: {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastBackup: new Date().toISOString(),
  },
  lifeplan: {
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  return {
    metadata: { ...defaultData.metadata, ...storedData.metadata },
    lifeplan: { ...defaultData.lifeplan, ...storedData.lifeplan },
    familyMembers: storedData.familyMembers || defaultData.familyMembers,
    accounts: storedData.accounts || defaultData.accounts,
    categories: storedData.categories || defaultData.categories,
    assetInfo: storedData.assetInfo || defaultData.assetInfo,
    holdingAssets: storedData.holdingAssets || defaultData.holdingAssets,
    templates: storedData.templates || defaultData.templates,
    yearlyData: storedData.yearlyData || defaultData.yearlyData,
  };
};

/**
 * 資産情報を取得
 */
export const getAssetInfo = () => {
  const data = loadData();
  return data.assetInfo || [];
};

/**
 * 特定の資産情報を取得
 */
export const getAssetById = (assetId) => {
  const assetInfo = getAssetInfo();
  return assetInfo.find((asset) => asset.id === assetId);
};

/**
 * 資産情報を保存
 */
export const saveAssetInfo = (assetInfoArray) => {
  const data = loadData();
  data.assetInfo = assetInfoArray;
  data.lifeplan.updatedAt = new Date().toISOString();
  return saveData(data);
};

/**
 * 単一の資産を追加または更新
 */
export const saveAsset = (asset) => {
  const data = loadData();
  const assetInfo = data.assetInfo || [];

  const existingIndex = assetInfo.findIndex((a) => a.id === asset.id);

  if (existingIndex >= 0) {
    // 既存の資産を更新
    assetInfo[existingIndex] = { ...asset, updatedAt: new Date().toISOString() };
  } else {
    // 新しい資産を追加
    assetInfo.push({ ...asset, createdAt: new Date().toISOString() });
  }

  data.assetInfo = assetInfo;
  data.lifeplan.updatedAt = new Date().toISOString();
  return saveData(data);
};

/**
 * 資産を削除（関連する保有資産と取引も削除）
 */
export const deleteAsset = (assetId) => {
  try {
    const data = loadData();

    // 資産情報から削除
    data.assetInfo = data.assetInfo.filter((asset) => asset.id !== assetId);

    // 関連する保有資産を削除
    data.holdingAssets = data.holdingAssets.filter((holding) => holding.assetId !== assetId);

    // 関連する取引を削除（年次データから）
    data.yearlyData = data.yearlyData.map((yearData) => ({
      ...yearData,
      transactions: yearData.transactions.filter(
        (transaction) =>
          !transaction.holdingAssetId ||
          !data.holdingAssets.some(
            (holding) => holding.id === transaction.holdingAssetId && holding.assetId === assetId
          )
      ),
    }));

    data.lifeplan.updatedAt = new Date().toISOString();
    return saveData(data);
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return false;
  }
};

/**
 * 保有資産を取得
 */
export const getHoldingAssets = () => {
  const data = loadData();
  return data.holdingAssets || [];
};

/**
 * 保有資産を保存
 */
export const saveHoldingAssets = (holdingAssetsArray) => {
  const data = loadData();
  data.holdingAssets = holdingAssetsArray;
  data.lifeplan.updatedAt = new Date().toISOString();
  return saveData(data);
};

/**
 * ライフプラン設定を取得
 */
export const getLifePlanSettings = () => {
  const data = loadData();
  return data.lifeplan?.settings || getDefaultData().lifeplan.settings;
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

// === ライフプラン管理 ===

/**
 * ライフプランリストを取得
 */
export const getLifePlans = () => {
  try {
    return JSON.parse(localStorage.getItem('lifePlans') || '[]');
  } catch (error) {
    console.error('Failed to load life plans:', error);
    return [];
  }
};

/**
 * ライフプランを保存
 */
export const saveLifePlan = (lifePlan) => {
  try {
    const existingPlans = getLifePlans();
    const updatedPlans = existingPlans.find((p) => p.id === lifePlan.id)
      ? existingPlans.map((p) => (p.id === lifePlan.id ? lifePlan : p))
      : [...existingPlans, lifePlan];

    localStorage.setItem('lifePlans', JSON.stringify(updatedPlans));
    return true;
  } catch (error) {
    console.error('Failed to save life plan:', error);
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
    return lifePlans.find((p) => p.id === activePlanId) || null;
  } catch (error) {
    console.error('Failed to get active life plan:', error);
    return null;
  }
};

// === カテゴリ管理 ===

/**
 * カテゴリを取得
 */
export const getCategories = () => {
  const data = loadData();
  if (data.categories && data.categories.length > 0) {
    return data.categories;
  }

  // 新しいデータ構造にカテゴリがない場合、レガシーから移行
  try {
    const legacyCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    if (legacyCategories.length > 0) {
      data.categories = legacyCategories;
      saveData(data);
      return legacyCategories;
    }
  } catch (error) {
    console.error('Failed to migrate legacy categories:', error);
  }

  return [];
};

/**
 * カテゴリを保存
 */
export const saveCategories = (categories) => {
  const data = loadData();
  data.categories = categories;
  data.lifeplan.updatedAt = new Date().toISOString();
  return saveData(data);
};

// === 口座管理 ===

/**
 * 口座を取得
 */
export const getAccounts = () => {
  const data = loadData();
  if (data.accounts && data.accounts.length > 0) {
    return data.accounts;
  }

  // 新しいデータ構造に口座がない場合、レガシーから移行
  try {
    const legacyAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    if (legacyAccounts.length > 0) {
      data.accounts = legacyAccounts;
      saveData(data);
      return legacyAccounts;
    }
  } catch (error) {
    console.error('Failed to migrate legacy accounts:', error);
  }

  return [];
};

/**
 * 口座を保存
 */
export const saveAccounts = (accounts) => {
  const data = loadData();
  data.accounts = accounts;
  data.lifeplan.updatedAt = new Date().toISOString();
  return saveData(data);
};

/**
 * 単一の口座を追加または更新
 */
export const saveAccount = (account) => {
  const data = loadData();
  const accounts = data.accounts || [];

  const existingIndex = accounts.findIndex((a) => a.id === account.id);

  if (existingIndex >= 0) {
    // 既存の口座を更新
    accounts[existingIndex] = { ...account, updatedAt: new Date().toISOString() };
  } else {
    // 新しい口座を追加
    accounts.push({ ...account, createdAt: new Date().toISOString() });
  }

  data.accounts = accounts;
  data.lifeplan.updatedAt = new Date().toISOString();
  return saveData(data);
};

// === 家族メンバー管理 ===

/**
 * 家族メンバーを取得
 */
export const getFamilyMembers = () => {
  const data = loadData();
  return data.familyMembers || [];
};

/**
 * 家族メンバーを保存
 */
export const saveFamilyMembers = (familyMembers) => {
  const data = loadData();
  data.familyMembers = familyMembers;
  data.lifeplan.updatedAt = new Date().toISOString();
  return saveData(data);
};

// === レガシーLocalStorageクリーンアップ ===

/**
 * レガシーLocalStorageキーをクリーンアップ
 */
export const cleanupLegacyStorage = () => {
  const legacyKeys = [
    'categories',
    'accounts',
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
