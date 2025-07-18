import React, { useState, useEffect, useRef } from 'react';
import { HiCalculator } from 'react-icons/hi2';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import {
  getLifePlanSettings,
  getTransactions,
  getAssetInfo,
  saveLifePlan,
  getActiveLifePlan,
  getFamilyMembers,
} from '../../utils/storage';

const FireSettingsForm = ({ onSave }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [fireSettings, setFireSettings] = useState({
    targetAmount: 50000000,
    isEnabled: true,
    selectedMemberId: '', // 選択された家族メンバー
  });
  const [simulationData, setSimulationData] = useState([]);
  const [achievementYear, setAchievementYear] = useState(null);
  const [achievementAge, setAchievementAge] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);

  // Uncontrolled Input用のref
  const targetAmountInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // FIRE設定が変更された時にシミュレーションを再計算
    calculateSimulation();
  }, [fireSettings.targetAmount, fireSettings.selectedMemberId]);

  const loadData = () => {
    try {
      const settings = getLifePlanSettings();
      const fireData = settings.fireSettings || {
        targetAmount: 50000000,
        isEnabled: true,
        selectedMemberId: '',
      };

      const members = getFamilyMembers();
      setFamilyMembers(members);

      // 選択されたメンバーがいない場合は、最初のメンバーを選択
      if (!fireData.selectedMemberId && members.length > 0) {
        fireData.selectedMemberId = members[0].id;
      }

      setFireSettings(fireData);
    } catch (error) {
      console.error('FIRE設定読み込みエラー:', error);
    }
  };

  // 選択されたメンバーの現在年齢を計算
  const getSelectedMemberCurrentAge = () => {
    if (!fireSettings.selectedMemberId || familyMembers.length === 0) {
      return 35; // デフォルト
    }

    const selectedMember = familyMembers.find((m) => m.id === fireSettings.selectedMemberId);
    if (!selectedMember || !selectedMember.birthYear) {
      return 35; // デフォルト
    }

    const currentYear = new Date().getFullYear();
    return currentYear - selectedMember.birthYear;
  };

  // レポートと同じロジックで資産推移を計算
  const calculateSimulation = () => {
    try {
      const settings = getLifePlanSettings();
      const assets = getAssetInfo();
      const yearlyAssetData = [];

      const selectedMemberCurrentAge = getSelectedMemberCurrentAge();

      // 年別データを初期化
      for (let year = settings.planStartYear; year <= settings.planEndYear; year++) {
        const ageInYear = selectedMemberCurrentAge + (year - new Date().getFullYear());
        yearlyAssetData.push({
          year,
          age: ageInYear,
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

        // 収入・支出取引も資産額に反映
        if (yearDataIndex >= 0 && Array.isArray(transactions)) {
          // 支出（expense）は減算、収入（income）は加算
          const expenseSum = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          const incomeSum = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          totalValue += incomeSum - expenseSum;
        }

        // 前年の資産額を引き継ぐ（累積計算）
        if (yearDataIndex > 0) {
          totalValue += yearlyAssetData[yearDataIndex - 1].totalAssetValue;
        }

        if (yearDataIndex >= 0) {
          yearlyAssetData[yearDataIndex].totalAssetValue = totalValue;
        }
      }

      // 目標金額達成年と年齢を計算
      const achievementData = yearlyAssetData.find(
        (data) => data.totalAssetValue >= fireSettings.targetAmount
      );

      if (achievementData) {
        setAchievementYear(achievementData.year);
        setAchievementAge(achievementData.age);
      } else {
        setAchievementYear(null);
        setAchievementAge(null);
      }

      setSimulationData(yearlyAssetData);
    } catch (error) {
      console.error('シミュレーション計算エラー:', error);
      setSimulationData([]);
    }
  };

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
          <p className="font-medium">{label}歳</p>
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

  const handleToggleEditMode = async () => {
    if (isEditMode) {
      // 保存処理時にinputの値を取得
      if (targetAmountInputRef.current) {
        const inputValue = targetAmountInputRef.current.value.replace(/[^0-9]/g, '');
        const newTargetAmount = parseInt(inputValue) || 0;

        const updatedFireSettings = {
          ...fireSettings,
          targetAmount: newTargetAmount,
        };

        setFireSettings(updatedFireSettings);

        try {
          const activeLifePlan = getActiveLifePlan();
          if (activeLifePlan) {
            const updatedPlan = {
              ...activeLifePlan,
              settings: {
                ...activeLifePlan.settings,
                fireSettings: updatedFireSettings,
              },
              updatedAt: new Date().toISOString(),
            };

            await saveLifePlan(updatedPlan);
            onSave(updatedFireSettings);
          }
        } catch (error) {
          console.error('FIRE設定保存エラー:', error);
          alert('保存に失敗しました');
          return;
        }
      }
    }
    setIsEditMode(!isEditMode);
  };

  // onBlurハンドラー
  const handleAmountBlur = () => {
    if (targetAmountInputRef.current) {
      const value = targetAmountInputRef.current.value.replace(/[^0-9]/g, '');
      const newTargetAmount = parseInt(value) || 0;
      setFireSettings((prev) => ({ ...prev, targetAmount: newTargetAmount }));
    }
  };

  // onKeyDownハンドラー（Enterキー）
  const handleAmountKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAmountBlur();
    }
  };

  // メンバー選択変更ハンドラー
  const handleMemberChange = (e) => {
    const selectedMemberId = e.target.value;
    setFireSettings((prev) => ({ ...prev, selectedMemberId }));
  };

  // 家族メンバー選択肢を準備（年齢表示なし）
  const memberOptions = familyMembers.map((member) => ({
    value: member.id,
    label: member.name,
  }));

  // 選択されたメンバーの情報を取得
  const selectedMember = familyMembers.find((m) => m.id === fireSettings.selectedMemberId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FIRE計画</h2>
          <p className="text-sm text-gray-600">経済的自立を達成するための計画を管理します</p>
        </div>
        <Button onClick={handleToggleEditMode}>{isEditMode ? '保存' : '編集'}</Button>
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">対象メンバー</h3>
            {isEditMode ? (
              <Select
                value={fireSettings.selectedMemberId}
                onChange={handleMemberChange}
                options={[{ value: '', label: 'メンバーを選択' }, ...memberOptions]}
                className="text-lg font-medium"
              />
            ) : (
              <p className="text-xl font-bold text-blue-600">
                {selectedMember ? selectedMember.name : '未選択'}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">目標達成時期</h3>
            <p className="text-2xl font-bold text-blue-600">
              {achievementYear ? `${achievementYear}年` : '期間内未達成'}
            </p>
            {achievementYear && achievementAge && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedMember ? selectedMember.name : '対象者'}が{achievementAge}歳の時
              </p>
            )}
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">必要資産額</h3>
            {isEditMode ? (
              <Input
                ref={targetAmountInputRef}
                type="text"
                defaultValue={fireSettings.targetAmount?.toLocaleString() || ''}
                onBlur={handleAmountBlur}
                onKeyDown={handleAmountKeyDown}
                placeholder="100,000,000"
                className="text-2xl font-bold"
              />
            ) : (
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(fireSettings.targetAmount)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* シミュレーション結果 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">シミュレーション結果</h3>
        <Card>
          {simulationData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="age"
                    label={{ value: '年齢', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis
                    tickFormatter={formatYAxis}
                    label={{ value: '資産額', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* 目標金額のライン */}
                  <ReferenceLine
                    y={fireSettings.targetAmount}
                    stroke="#dc3545"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{ value: '目標金額', position: 'topLeft' }}
                  />

                  {/* 資産推移のライン */}
                  <Line
                    type="monotone"
                    dataKey="totalAssetValue"
                    stroke="#007bff"
                    strokeWidth={3}
                    name="資産総額"
                    dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <HiCalculator className="h-12 w-12 mx-auto mb-4" />
                <p>投資データがありません</p>
                <p className="text-sm mt-2">投資取引を追加してシミュレーションを開始</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FireSettingsForm;
