あなたは以下のコーディングルールに従ってコードを記述します。

# ライフプランアプリ コーディング規約

## 1. フォーム入力コンポーネントの実装規約

### 1.1 入力フィールドの実装方針

テキスト入力や数値入力などのユーザー入力が発生するフィールドでは、**スムーズな入力体験**を最優先とする。

#### ❌ 避けるべき実装（Controlled Component with onChange）

```javascript
// 悪い例：毎回onChangeが実行され、入力がスムーズでない
const [value, setValue] = useState('');

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)} // 毎回実行される
/>;
```

#### ✅ 推奨実装（Uncontrolled Component with ref）

```javascript
// 良い例：uncontrolled component + ref
import { useRef } from 'react';

const inputRef = useRef(null);

const handleBlur = () => {
  if (inputRef.current) {
    const value = inputRef.current.value;
    setFormData((prev) => ({ ...prev, fieldName: value }));
  }
};

<Input
  ref={inputRef}
  defaultValue={initialValue}
  onBlur={handleBlur}
  // onChangeは使用しない
/>;
```

### 1.2 実装パターンの選択基準

| 入力タイプ           | 推奨実装              | 理由                       |
| -------------------- | --------------------- | -------------------------- |
| テキスト入力         | uncontrolled + ref    | 最もスムーズな入力体験     |
| 数値入力             | uncontrolled + ref    | 計算処理が重い場合の最適化 |
| 選択（Select/Radio） | controlled            | 選択は即座に反映が必要     |
| チェックボックス     | controlled            | 状態変更は即座に反映が必要 |
| 検索フィールド       | debounce + controlled | リアルタイム検索が必要     |

### 1.3 Selectコンポーネントの正しい使用方法

Selectコンポーネントは**controlled component**として使用し、**onChangeでeventオブジェクトを受け取る**ことを統一する。

#### ✅ 正しい実装

```javascript
<Select
  value={formData.year}
  onChange={(e) => setFormData((prev) => ({ ...prev, year: parseInt(e.target.value) }))}
  options={yearOptions}
/>
```

#### ❌ 避けるべき実装

```javascript
// 悪い例：valueを直接受け取る（動作が不安定）
<Select
  value={formData.year}
  onChange={(value) => setFormData((prev) => ({ ...prev, year: parseInt(value) }))}
  options={yearOptions}
/>
```

**重要:** Selectコンポーネントでは必ずeventオブジェクト（e）を受け取り、`e.target.value`で値を取得する。これにより、他のフォーム要素との一貫性を保ち、予期しない動作を防ぐ。

### 1.4 uncontrolled component実装テンプレート

```javascript
import React, { useState, useRef } from 'react';

const MyFormComponent = () => {
  // ref定義
  const textInputRef = useRef(null);
  const numberInputRef = useRef(null);

  // フォームデータ
  const [formData, setFormData] = useState({
    textField: '',
    numberField: 0,
    selectField: defaultValue, // Selectは controlled
  });

  // ブラー処理
  const handleTextBlur = () => {
    if (textInputRef.current) {
      const value = textInputRef.current.value;
      setFormData((prev) => ({ ...prev, textField: value }));
    }
  };

  const handleNumberBlur = () => {
    if (numberInputRef.current) {
      const value = parseFloat(numberInputRef.current.value) || 0;
      setFormData((prev) => ({ ...prev, numberField: value }));
    }
  };

  // Select用のchange処理
  const handleSelectChange = (e) => {
    setFormData((prev) => ({ ...prev, selectField: parseInt(e.target.value) }));
  };

  // 保存処理（最新値の取得）
  const handleSave = () => {
    // 保存前にrefから最新値を取得
    const finalData = {
      textField: textInputRef.current?.value || formData.textField,
      numberField: parseFloat(numberInputRef.current?.value) || formData.numberField,
      selectField: formData.selectField, // controlledなのでstateから取得
    };

    // バリデーション・保存処理
    console.log('保存データ:', finalData);
  };

  return (
    <form>
      <Input
        ref={textInputRef}
        defaultValue={formData.textField}
        onBlur={handleTextBlur}
        placeholder="テキストを入力"
      />

      <Input
        ref={numberInputRef}
        type="number"
        defaultValue={formData.numberField}
        onBlur={handleNumberBlur}
        placeholder="数値を入力"
      />

      <Select value={formData.selectField} onChange={handleSelectChange} options={selectOptions} />

      <Button onClick={handleSave}>保存</Button>
    </form>
  );
};
```

## 2. データ設計・ストレージ規約

### 2.1 ライフプラン範囲の活用

年を選択する機能では、必ずライフプラン設定の範囲を使用する。

```javascript
import { getLifePlanSettings } from '../../utils/storage';

const generateYearOptions = () => {
  try {
    const settings = getLifePlanSettings();
    const startYear = settings.planStartYear;
    const endYear = settings.planEndYear;

    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({ value: year, label: `${year}年` });
    }
    return years;
  } catch (error) {
    console.error('ライフプラン設定の取得に失敗:', error);
    // フォールバック処理
    return getDefaultYearOptions();
  }
};
```

### 2.2 アクティブライフプラン依存データの管理

アクティブライフプランに依存するデータ（カテゴリ、口座、資産など）は、必ずアクティブライフプランから取得・保存する。

```javascript
// ✅ 正しい実装
import { getCategories, saveCategories } from '../../utils/storage';

const categories = getCategories(); // アクティブライフプランから取得
saveCategories(updatedCategories); // アクティブライフプランに保存

// ❌ 避けるべき実装
const categories = data.categories; // 全体データから直接取得（古い方法）
```

## 3. コンポーネント設計規約

### 3.1 プロップスの設計

#### 必須プロップス

- `onSave`: データ保存時のコールバック関数
- `initialData`: 初期データ（編集時）

#### オプショナルプロップス

- `onCancel`: キャンセル時のコールバック関数
- `isEditing`: 編集モード判定フラグ
- `disabled`: 無効化フラグ

```javascript
const MyFormComponent = ({
  onSave, // required
  initialData, // required
  onCancel, // optional
  isEditing = false, // optional with default
  disabled = false, // optional with default
}) => {
  // コンポーネント実装
};
```

### 3.2 エラーハンドリング

```javascript
// エラー状態の管理
const [errors, setErrors] = useState({});

// バリデーション関数
const validateForm = () => {
  const newErrors = {};

  if (!formData.requiredField?.trim()) {
    newErrors.requiredField = '必須項目です';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// エラー表示
{
  errors.fieldName && <p className="mt-1 text-sm text-red-600">{errors.fieldName}</p>;
}
```

## 4. インポート順序規約

```javascript
// 1. React関連
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 外部ライブラリ
import { debounce } from 'lodash';

// 3. 内部コンポーネント（UI -> layout -> forms -> pages）
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Header from '../layout/Header';
import MyForm from '../forms/MyForm';

// 4. ユーティリティ・ストレージ
import { getLifePlanSettings, saveData } from '../../utils/storage';
import { formatCurrency } from '../../utils/format';

// 5. 定数・設定
import { API_ENDPOINTS } from '../../constants';
```

# 使用ライブラリについて

- Recharts
  - PieChartWithCustomizedLabel：円グラフ
    - https://recharts.org/en-US/examples/PieChartWithCustomizedLabel
  - LineChartWithXAxisPadding：折れ線グラフ
    - https://recharts.org/en-US/examples/LineChartWithXAxisPadding
- Tailwind CSS
  - https://tailwindcss.com/plus/ui-blocks/preview
- react-icons
  - https://react-icons.github.io/react-icons/
- Zustand
  - https://zustand.docs.pmnd.rs/getting-started/introduction
- react-router-dom
- ESLint, Prettier
- storybook
- clsx

# フォルダ構成について

## 概要

本プロジェクトは Reactで構築されたライフプラン管理アプリケーションです。Atomic Design パターンと Feature-based Architecture を組み合わせた構成で、保守性と拡張性を重視した設計となっています。

## プロジェクト全体構成

```
shin-lifeplan-app/
├── public/                  # 静的ファイル
│   ├── index.html          # エントリーポイント
│   ├── favicon.ico         # ファビコン
│   └── manifest.json       # PWA設定
├── src/                    # ソースコード
├── doc/                    # ドキュメント
├── .storybook/             # Storybook設定
├── package.json            # 依存関係定義
├── tailwind.config.js      # TailwindCSS設定
└── postcss.config.js       # PostCSS設定
```

## src/ フォルダ詳細構成

```
src/
├── components/            # コンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── layout/           # レイアウト関連コンポーネント
│   ├── forms/            # フォーム関連コンポーネント
│   └── pages/            # ページコンポーネント
├── assets/               # 静的アセット
├── constants/            # 定数定義
├── hooks/                # カスタムフック
├── services/             # API・外部サービス
├── store/                # 状態管理
├── utils/                # ユーティリティ関数
├── index.css             # メインCSS
├── index.js              # エントリーポイント
```

## 各フォルダの詳細

### `components/`

- **`ui/`**: 再利用可能な基本UIコンポーネント
- **`layout/`**: レイアウト構成要素（ヘッダー、設定系）
- **`forms/`**: フォーム関連コンポーネント
- **`pages/`**: 各画面のメインコンポーネント

### その他のフォルダ

- **`assets/`**: 静的ファイル（画像、スタイルなど）
- **`constants/`**: アプリ全体で使用する定数
- **`hooks/`**: カスタムReactフック
- **`services/`**: API通信など外部サービス
- **`store/`**: アプリケーション状態管理
- **`utils/`**: ユーティリティ関数
- **`Router.js`**: ルーティング設定

## 設計方針

### 1. コンポーネント分類

- **UI**: 汎用的な再利用可能コンポーネント（Button、Input、Modalなど）
- **Layout**: アプリケーション全体のレイアウト構成要素
- **Forms**: フォーム専用コンポーネント
- **Pages**: 各画面のメインコンポーネント（Router.jsでルーティング）

### 2. 命名規則

- **コンポーネント**: PascalCase（例: `TransactionList.js`）
- **フック**: camelCase + use接頭辞（例: `useTransactions.js`）
- **サービス**: camelCase（例: `apiService.js`）
- **ストア**: camelCase（例: `transactionStore.js`）

### 3. インポート規則

`components/ui/index.js` で一括エクスポートにより、きれいなインポートパスを提供

```javascript
// 推奨
import { Button, Input, Modal } from 'components/ui';
// 非推奨
import Button from 'components/ui/Button';
```

# データ構造

## サンプル

以下は、ライフプラン管理アプリケーションのデータ構造のサンプルです。
この構造は、アプリケーションのメタデータ（metadata）とライフプラン（lifeplan）の基本情報を含んでいます。
基本情報は、ライフプランの設定（settings）、家族メンバー（familyMembers）、口座（accounts）、カテゴリ（categories）、資産情報（assetInfo）、保有資産（holdingAssets）、テンプレート（templates）、年次データ（yearlyData）を含みます。

```json
{
  "metadata": {
    "version": "1.0.0",
    "createdAt": "2025-06-22T20:46:10.253Z",
    "lastBackup": "2025-06-25T15:04:28.123Z"
  },
  "lifeplan": [
    {
      "id": "lp_1750747644525",
      "name": "test",
      "settings": {
        "currency": "JPY",
        "planStartYear": 2020,
        "planEndYear": 2101,
        "fireSettings": {
          "targetAmount": 20000000,
          "isEnabled": true
        },
        "displaySettings": {
          "dateFormat": "YYYY-MM-DD",
          "numberFormat": "comma"
        }
      },
      "familyMembers": [],
      "accounts": [],
      "categories": [],
      "assetInfo": [],
      "holdingAssets": [],
      "templates": [],
      "yearlyData": [],
      "createdAt": "2025-06-24T06:47:24.525Z",
      "updatedAt": "2025-06-25T15:04:28.123Z"
    }
  ]
}
```

## 1. メタデータ（metadata）

アプリケーション全体のメタ情報を管理します。

| フィールド名 | 型      | 必須 | 説明                       | 値の例                     |
| ------------ | ------- | ---- | -------------------------- | -------------------------- |
| version      | string  | ○    | データスキーマのバージョン | "1.0.0"                    |
| createdAt    | ISO8601 | ○    | データ作成日時             | "2024-01-01T00:00:00.000Z" |
| lastBackup   | ISO8601 | ○    | 最終バックアップ日時       | "2024-01-01T00:00:00.000Z" |

## 2. ライフプラン（lifeplan）

### 2.1 基本情報

| フィールド名 | 型      | 必須 | 説明                     | 値の例                     |
| ------------ | ------- | ---- | ------------------------ | -------------------------- |
| id           | string  | ○    | ライフプランの一意識別子 | "lp_001"                   |
| name         | string  | ○    | ライフプラン名           | "我が家のライフプラン"     |
| createdAt    | ISO8601 | ○    | 作成日時                 | "2024-01-01T00:00:00.000Z" |
| updatedAt    | ISO8601 | ○    | 更新日時                 | "2024-01-01T00:00:00.000Z" |

### 2.2 設定（settings）

| フィールド名                 | 型      | 必須 | 説明                | 値の例       |
| ---------------------------- | ------- | ---- | ------------------- | ------------ |
| currency                     | string  | ○    | 通貨コード（固定）  | "JPY"        |
| planStartYear                | number  | ○    | ライフプラン開始年  | 2024         |
| planEndYear                  | number  | ○    | ライフプラン終了年  | 2080         |
| fireSettings.targetAmount    | number  | ○    | FIRE目標金額        | 50000000     |
| fireSettings.isEnabled       | boolean | ○    | FIRE機能の有効/無効 | true         |
| displaySettings.dateFormat   | string  | ○    | 日付表示形式        | "YYYY-MM-DD" |
| displaySettings.numberFormat | string  | ○    | 数値表示形式        | "comma"      |

## 3. 家族メンバー（familyMembers）

家族構成員の情報を管理します。

| フィールド名   | 型      | 必須 | 説明                     | 値の例                     |
| -------------- | ------- | ---- | ------------------------ | -------------------------- |
| id             | string  | ○    | 家族メンバーの一意識別子 | "fm_001"                   |
| name           | string  | ○    | 氏名                     | "田中太郎"                 |
| birthDate      | ISO8601 | ○    | 生年月日                 | "1985-05-15"               |
| lifeExpectancy | number  | ○    | 寿命（年）               | 85                         |
| createdAt      | ISO8601 | ○    | 作成日時                 | "2024-01-01T00:00:00.000Z" |

**寿命の設定指針：**

- 男性：80-85歳
- 女性：85-90歳
- 健康状態や家族歴を考慮して調整

## 4. 口座（accounts）

金融機関の口座情報を管理します。

| フィールド名   | 型      | 必須 | 説明             | 値の例                     |
| -------------- | ------- | ---- | ---------------- | -------------------------- |
| id             | string  | ○    | 口座の一意識別子 | "acc_001"                  |
| name           | string  | ○    | 口座名           | "メイン銀行普通預金"       |
| initialBalance | number  | ○    | 初期残高（円）   | 1000000                    |
| displayOrder   | number  | ○    | 表示順序         | 1                          |
| createdAt      | ISO8601 | ○    | 作成日時         | "2024-01-01T00:00:00.000Z" |

**口座の種類例：**

- 普通預金、定期預金
- 証券口座
- クレジットカード口座
- 現金・タンス預金

## 5. カテゴリ（categories）

収支の分類を管理します。

| フィールド名 | 型      | 必須 | 説明                 | 値の例                     |
| ------------ | ------- | ---- | -------------------- | -------------------------- |
| id           | string  | ○    | カテゴリの一意識別子 | "cat_001"                  |
| name         | string  | ○    | カテゴリ名           | "食費"                     |
| type         | string  | ○    | カテゴリタイプ       | "expense" / "income"       |
| color        | string  | ○    | 表示色（HEX）        | "#FF6B6B"                  |
| displayOrder | number  | ○    | 表示順序             | 1                          |
| createdAt    | ISO8601 | ○    | 作成日時             | "2024-01-01T00:00:00.000Z" |

**カテゴリタイプ：**

- expense：支出
- income：収入

**推奨カテゴリ例：**

支出カテゴリ：

- 食費、住宅費、光熱費、通信費、交通費、医療費、保険料、教育費、娯楽費

収入カテゴリ：

- 給与、ボーナス、副業収入、投資収益、年金

## 6. 資産情報（assetInfo）

投資可能な資産の基本情報と価格履歴を管理します。

| フィールド名 | 型      | 必須 | 説明               | 値の例                     |
| ------------ | ------- | ---- | ------------------ | -------------------------- |
| id           | string  | ○    | 資産の一意識別子   | "ai_001"                   |
| name         | string  | ○    | 資産名             | "日経225連動投信"          |
| symbol       | string  | ○    | ティッカーシンボル | "1321"                     |
| description  | string  | ×    | 資産の説明         | "インデックス投資信託"     |
| currency     | string  | ○    | 通貨コード         | "JPY"                      |
| createdAt    | ISO8601 | ○    | 作成日時           | "2024-01-01T00:00:00.000Z" |

### 6.1 価格履歴（priceHistory）

| フィールド名 | 型     | 必須 | 説明               | 値の例 |
| ------------ | ------ | ---- | ------------------ | ------ |
| year         | number | ○    | 年                 | 2024   |
| price        | number | ○    | その年の価格（円） | 28500  |

### 6.2 配当履歴（dividendHistory）

| フィールド名     | 型     | 必須 | 説明                  | 値の例 |
| ---------------- | ------ | ---- | --------------------- | ------ |
| year             | number | ○    | 年                    | 2024   |
| dividendPerShare | number | ○    | 1株当たり配当金（円） | 180    |

## 7. 保有資産（holdingAssets）

実際に保有している資産の情報を管理します。

| フィールド名 | 型      | 必須 | 説明                     | 値の例                     |
| ------------ | ------- | ---- | ------------------------ | -------------------------- |
| id           | string  | ○    | 保有資産の一意識別子     | "ha_001"                   |
| assetId      | string  | ○    | 資産情報への参照         | "ai_001"                   |
| quantity     | number  | ○    | 保有数量                 | 100                        |
| purchaseYear | number  | ○    | 購入年                   | 2024                       |
| sellYear     | number  | ×    | 売却年（未売却時はnull） | null / 2025                |
| accountId    | string  | ○    | 保管口座への参照         | "acc_002"                  |
| createdAt    | ISO8601 | ○    | 作成日時                 | "2024-03-15T00:00:00.000Z" |
| updatedAt    | ISO8601 | ○    | 更新日時                 | "2024-03-15T00:00:00.000Z" |

**sellYearについて：**

- null：現在も保有中
- 年数：その年に売却済み

## 8. テンプレート（templates）

定期的な取引のテンプレートを管理します。

| フィールド名   | 型            | 必須 | 説明                           | 値の例                     |
| -------------- | ------------- | ---- | ------------------------------ | -------------------------- |
| id             | string        | ○    | テンプレートの一意識別子       | "tmp_001"                  |
| name           | string        | ○    | テンプレート名                 | "家賃支払い"               |
| type           | string        | ○    | 取引タイプ                     | "expense"                  |
| amount         | number        | ○    | 金額（円）                     | 120000                     |
| description    | string        | ○    | 説明                           | "月次家賃"                 |
| categoryId     | string        | ○    | カテゴリへの参照               | "cat_003"                  |
| accountId      | string        | ○    | 口座への参照                   | "acc_001"                  |
| holdingAssetId | string        | ×    | 保有資産への参照（投資時のみ） | "ha_001" / null            |
| tags           | array[string] | ×    | タグ                           | ["固定費", "定期支払い"]   |
| lastUsed       | ISO8601       | ○    | 最終使用日時                   | "2024-12-25T00:00:00.000Z" |
| createdAt      | ISO8601       | ○    | 作成日時                       | "2023-01-01T00:00:00.000Z" |

**取引タイプ：**

- expense：支出
- income：収入
- investment：投資

### 8.1 テンプレート内取引（transactions）

| フィールド名   | 型            | 必須 | 説明                           | 値の例                     |
| -------------- | ------------- | ---- | ------------------------------ | -------------------------- |
| id             | string        | ○    | テンプレート取引の一意識別子   | "tmpl_txn_001"             |
| title          | string        | ○    | 取引タイトル                   | "家賃支払い"               |
| annualCount    | number        | ○    | 年間発生回数                   | 12                         |
| amount         | number        | ○    | 1回当たりの金額（円）          | 120000                     |
| description    | string        | ○    | 説明                           | "月次家賃"                 |
| categoryId     | string        | ○    | カテゴリへの参照               | "cat_003"                  |
| fromAccountId  | string        | ×    | 出金元口座（支出・投資時）     | "acc_001" / null           |
| toAccountId    | string        | ×    | 入金先口座（収入・投資時）     | "acc_001" / null           |
| holdingAssetId | string        | ×    | 保有資産への参照（投資時のみ） | "ha_001" / null            |
| quantity       | number        | ×    | 資産の購入数量（投資時のみ）   | 2 / null                   |
| tags           | array[string] | ×    | タグ                           | ["固定費"]                 |
| createdAt      | ISO8601       | ○    | 作成日時                       | "2024-01-01T00:00:00.000Z" |
| updatedAt      | ISO8601       | ○    | 更新日時                       | "2024-01-01T00:00:00.000Z" |

**年間発生回数の例：**

- 月次：12回
- 半年ごと：2回
- 年次：1回
- 四半期：4回

## 9. 年次データ（yearlyData）

年ごとの取引とイベントを管理します。

### 9.1 年次データ構造

| フィールド名 | 型            | 必須 | 説明                 | 値の例 |
| ------------ | ------------- | ---- | -------------------- | ------ |
| year         | number        | ○    | 年                   | 2024   |
| transactions | array[object] | ○    | その年の取引一覧     | [...]  |
| events       | array[object] | ○    | その年のイベント一覧 | [...]  |

### 9.2 取引（transactions）

| フィールド名   | 型            | 必須 | 説明                       | 値の例                     |
| -------------- | ------------- | ---- | -------------------------- | -------------------------- |
| id             | string        | ○    | 取引の一意識別子           | "txn_2024_001"             |
| title          | string        | ○    | 取引タイトル               | "家賃支払い"               |
| type           | string        | ○    | 取引タイプ                 | "expense"                  |
| year           | number        | ○    | 年                         | 2024                       |
| month          | number        | ○    | 月                         | 1                          |
| amount         | number        | ○    | 金額（円）                 | 120000                     |
| description    | string        | ○    | 説明                       | "家賃支払い"               |
| categoryId     | string        | ○    | カテゴリへの参照           | "cat_003"                  |
| fromAccountId  | string        | ×    | 出金元口座                 | "acc_001" / null           |
| toAccountId    | string        | ×    | 入金先口座                 | "acc_001" / null           |
| holdingAssetId | string        | ×    | 保有資産への参照           | "ha_001" / null            |
| quantity       | number        | ×    | 資産の取引数量             | 2 / null                   |
| tags           | array[string] | ×    | タグ                       | ["固定費"]                 |
| templateId     | string        | ×    | 生成元テンプレートへの参照 | "tmp_001" / null           |
| createdAt      | ISO8601       | ○    | 作成日時                   | "2024-01-25T12:00:00.000Z" |
| updatedAt      | ISO8601       | ○    | 更新日時                   | "2024-01-25T12:00:00.000Z" |

**取引タイプ：**

- expense：支出
- income：収入
- investment：投資
- transfer：振替

**月：1-12の整数**

### 9.3 イベント（events）

| フィールド名   | 型            | 必須 | 説明                   | 値の例                     |
| -------------- | ------------- | ---- | ---------------------- | -------------------------- |
| id             | string        | ○    | イベントの一意識別子   | "evt_2024_001"             |
| title          | string        | ○    | イベントタイトル       | "投資開始"                 |
| description    | string        | ○    | イベントの説明         | "積立投資を開始"           |
| year           | number        | ○    | 年                     | 2024                       |
| transactionIds | array[string] | ○    | 関連する取引IDのリスト | ["txn_2024_003"]           |
| createdAt      | ISO8601       | ○    | 作成日時               | "2024-01-01T00:00:00.000Z" |

**イベントの活用例：**

- 住宅購入（複数の取引をまとめる）
- 投資開始
- 転職
- 結婚・出産
- 退職
