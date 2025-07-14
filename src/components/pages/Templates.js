import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import TemplateTransactionForm from '../forms/TemplateTransactionForm';
import {
  getTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  getCategories,
  getAccounts,
} from '../../utils/storage';

import TutorialSpotlight from '../layout/TutorialSpotlight';
import { getLifePlanSettings, saveLifePlanSettings } from '../../utils/storage';

const Templates = () => {
  const [activeTab, setActiveTab] = useState('expense');
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // チュートリアル用
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [settings, setSettings] = useState(getLifePlanSettings());
  const tabHeaderRef = useRef(null);
  const addBtnRef = useRef(null);

  // チュートリアルステップ定義
  const tutorialSteps = [
    {
      key: 'tab-expense',
      label: '支出テンプレートタブ',
      desc: '「支出テンプレート」タブでは、よく使う支出取引のテンプレートを管理できます。',
      targetRef: tabHeaderRef,
      panelSide: 'bottom',
      panelWidth: 340,
      panelHeight: 140,
      tabId: 'expense',
    },
    {
      key: 'tab-income',
      label: '収入テンプレートタブ',
      desc: '「収入テンプレート」タブでは、よく使う収入取引のテンプレートを管理できます。',
      targetRef: tabHeaderRef,
      panelSide: 'bottom',
      panelWidth: 340,
      panelHeight: 140,
      tabId: 'income',
    },
    {
      key: 'tab-investment',
      label: '投資テンプレートタブ',
      desc: '「投資テンプレート」タブでは、よく使う投資取引のテンプレートを管理できます。',
      targetRef: tabHeaderRef,
      panelSide: 'bottom',
      panelWidth: 340,
      panelHeight: 140,
      tabId: 'investment',
    },
    {
      key: 'add-template',
      label: '新規テンプレート作成ボタン',
      desc: 'ここから新しいテンプレートを作成できます。',
      targetRef: addBtnRef,
      panelSide: 'left',
      panelWidth: 320,
      panelHeight: 120,
    },
  ];

  // チュートリアル進行時にタブを自動切り替え
  useEffect(() => {
    if (showTutorial && tutorialSteps[tutorialStep]?.tabId) {
      setActiveTab(tutorialSteps[tutorialStep].tabId);
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
          templates: true,
        },
      };
      saveLifePlanSettings(newSettings);
      setSettings(newSettings);
    }
    setShowTutorial(false);
  };

  // チュートリアル表示制御
  useEffect(() => {
    if (settings && settings.tutorialStatus && settings.tutorialStatus.templates !== true) {
      setShowTutorial(true);
      setTutorialStep(0);
    }
  }, [settings]);

  // モーダル状態
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 編集状態
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // フォーム状態
  const [templateName, setTemplateName] = useState('');

  // タブ設定
  const tabs = [
    { id: 'expense', label: '支出テンプレート', color: '#dc3545' },
    { id: 'income', label: '収入テンプレート', color: '#28a745' },
    { id: 'investment', label: '投資テンプレート', color: '#20c997' },
  ];

  // データ読み込み
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    try {
      setTemplates(getTemplates(activeTab));
      setCategories(getCategories());
      setAccounts(getAccounts());
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  };

  // 新規テンプレート作成
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setIsTemplateModalOpen(true);
  };

  // テンプレート保存
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    const templateData = {
      id: editingTemplate?.id || `tmp_${Date.now()}`,
      name: templateName.trim(),
      type: activeTab,
      transactions: editingTemplate?.transactions || [],
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      let success;
      if (editingTemplate) {
        success = updateTemplate(templateData);
      } else {
        success = saveTemplate(templateData);
      }

      if (success) {
        loadData();
        setIsTemplateModalOpen(false);
        setTemplateName('');
        setEditingTemplate(null);
      }
    } catch (error) {
      console.error('テンプレート保存エラー:', error);
    }
  };

  // テンプレート編集
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setIsTemplateModalOpen(true);
  };

  // テンプレート削除確認
  const handleConfirmDelete = (template) => {
    setDeletingTemplate(template);
    setIsDeleteModalOpen(true);
  };

  // テンプレート削除
  const handleDeleteTemplate = () => {
    if (!deletingTemplate) return;

    try {
      const success = deleteTemplate(deletingTemplate.id);
      if (success) {
        loadData();
        setIsDeleteModalOpen(false);
        setDeletingTemplate(null);
      }
    } catch (error) {
      console.error('テンプレート削除エラー:', error);
    }
  };

  // 取引追加
  const handleAddTransaction = (template) => {
    setSelectedTemplate(template);
    setIsTransactionModalOpen(true);
  };

  // 取引保存完了
  const handleTransactionSaved = () => {
    loadData();
    setIsTransactionModalOpen(false);
    setSelectedTemplate(null);
    setEditingTransaction(null);
  };

  // 取引編集
  const handleEditTransaction = (template, transaction) => {
    setSelectedTemplate(template);
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  // カテゴリ名を取得
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : '不明なカテゴリ';
  };

  // 口座名を取得
  const getAccountName = (accountId) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? account.name : '不明な口座';
  };

  // 金額をフォーマット
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  // 金額の表示スタイルを取得
  const getAmountStyle = (type) => {
    switch (type) {
      case 'expense':
        return 'text-red-600';
      case 'income':
        return 'text-green-600';
      case 'investment':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // 金額のプレフィックスを取得
  const getAmountPrefix = (type) => {
    switch (type) {
      case 'expense':
        return '-';
      case 'income':
        return '+';
      default:
        return '';
    }
  };

  // 年間回数を計算
  const getAnnualCount = (transaction) => {
    return transaction?.frequency || 1;
  };

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
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">テンプレート管理</h1>
          <div ref={addBtnRef}>
            <Button onClick={handleCreateTemplate} className="flex items-center space-x-2">
              <FiPlus className="w-4 h-4" />
              <span>新規テンプレート</span>
            </Button>
          </div>
        </div>

        {/* タブ切り替え */}
        <Card className="mb-6">
          <div className="flex bg-gray-100 rounded-full p-1" ref={tabHeaderRef}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* テンプレートリスト */}
        <div className="space-y-6">
          {templates.length > 0 ? (
            templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="p-6">
                  {/* テンプレートヘッダー */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                      <span className="text-sm text-gray-500">
                        年
                        {template.transactions && template.transactions.length > 0
                          ? getAnnualCount(template.transactions[0])
                          : 1}
                        回
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTransaction(template)}
                        className="flex items-center space-x-1"
                      >
                        <FiPlus className="w-4 h-4" />
                        <span>取引追加</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="flex items-center space-x-1"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>編集</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmDelete(template)}
                        className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>削除</span>
                      </Button>
                    </div>
                  </div>

                  {/* 取引リスト */}
                  {template.transactions && template.transactions.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      {/* ヘッダー */}
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                          <div>口座</div>
                          <div>カテゴリ</div>
                          <div>メモ</div>
                          <div>
                            {activeTab === 'expense'
                              ? 'インフレ率'
                              : activeTab === 'income'
                                ? '昇給率'
                                : '数量'}
                          </div>
                          <div>
                            {activeTab === 'investment'
                              ? '投資金額'
                              : `${activeTab === 'expense' ? '支出' : '収入'}金額`}
                          </div>
                          <div>編集</div>
                        </div>
                      </div>

                      {/* 取引データ */}
                      <div className="divide-y">
                        {template.transactions.map((transaction) => (
                          <div key={transaction.id} className="px-4 py-3">
                            <div className="grid grid-cols-6 gap-4 items-center">
                              <div className="text-sm text-gray-900">
                                {getAccountName(
                                  transaction.toAccountId || transaction.fromAccountId
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {getCategoryName(transaction.categoryId)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {transaction.title || transaction.memo || '-'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {activeTab === 'investment'
                                  ? `${transaction.quantity || 0}株/口`
                                  : `${transaction.inflationRate || transaction.salaryIncreaseRate || 0}%`}
                              </div>
                              <div className={`text-sm font-medium ${getAmountStyle(activeTab)}`}>
                                {getAmountPrefix(activeTab)}¥
                                {formatAmount(transaction.amount * (transaction.frequency || 1))}
                                {transaction.frequency > 1 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (年{transaction.frequency}回)
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <button
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                  onClick={() => handleEditTransaction(template, transaction)}
                                >
                                  ✎
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                      <p>取引がありません</p>
                      <p className="text-sm mt-1">取引追加ボタンから取引を追加してください</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <h3 className="text-lg font-medium mb-2">
                  {tabs.find((t) => t.id === activeTab)?.label}がありません
                </h3>
                <p className="text-sm mb-4">よく使う取引のテンプレートを作成できます</p>
                <Button
                  onClick={handleCreateTemplate}
                  className="flex items-center space-x-2 mx-auto"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>新規テンプレートを作成</span>
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* テンプレート名入力モーダル */}
        <Modal
          isOpen={isTemplateModalOpen}
          onClose={() => {
            setIsTemplateModalOpen(false);
            setEditingTemplate(null);
            setTemplateName('');
          }}
          title={
            editingTemplate
              ? 'テンプレート編集'
              : `${tabs.find((t) => t.id === activeTab)?.label}名`
          }
          size="sm"
        >
          <div className="space-y-4">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="テンプレート名を入力"
              className="w-full"
            />
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsTemplateModalOpen(false);
                  setEditingTemplate(null);
                  setTemplateName('');
                }}
              >
                キャンセル
              </Button>
              <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                保存
              </Button>
            </div>
          </div>
        </Modal>

        {/* 取引追加モーダル */}
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={() => {
            setIsTransactionModalOpen(false);
            setSelectedTemplate(null);
          }}
          title={editingTransaction ? '取引テンプレート編集' : '取引テンプレート追加'}
          size="lg"
        >
          {selectedTemplate && (
            <TemplateTransactionForm
              templateId={selectedTemplate.id}
              templateType={selectedTemplate.type}
              transaction={editingTransaction}
              isEditing={!!editingTransaction}
              onSave={handleTransactionSaved}
              onCancel={() => {
                setIsTransactionModalOpen(false);
                setSelectedTemplate(null);
                setEditingTransaction(null);
              }}
            />
          )}
        </Modal>

        {/* 削除確認モーダル */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingTemplate(null);
          }}
          title="テンプレート削除"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">「{deletingTemplate?.name}」を削除しますか？</p>
            <p className="text-sm text-gray-500">
              この操作は取り消すことができません。テンプレート内の取引も全て削除されます。
            </p>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingTemplate(null);
                }}
              >
                キャンセル
              </Button>
              <Button variant="danger" onClick={handleDeleteTemplate}>
                削除
              </Button>
            </div>
          </div>
        </Modal>
      </div>
      );
    </TutorialSpotlight>
  );
};

export default Templates;
