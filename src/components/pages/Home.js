import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlay, HiArrowDownTray } from 'react-icons/hi2';
import Button from '../ui/Button';
import { importData } from '../../utils/storage';

const Home = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/create');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await importData(file);
          alert('データをインポートしました');
          // インポート成功後、ダッシュボードに遷移
          navigate('/dashboard');
        } catch (error) {
          console.error('インポートエラー:', error);
          alert('インポートに失敗しました。正しいJSONファイルを選択してください。');
        }
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* ロゴ・タイトル部分 */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 shadow-lg">
            <span className="text-2xl font-bold text-white">SLP</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 text-white mb-2">Shin Life Plan App</h1>
        </div>

        {/* 説明カード */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">家族構成の設定</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">ライフプラン期間の設定</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">FIRE計画の作成</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-4">
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <HiPlay className="h-5 w-5 mr-2" />
            始める
          </Button>

          <Button
            onClick={handleImport}
            variant="outline"
            size="lg"
            className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <HiArrowDownTray className="h-5 w-5 mr-2" />
            データをインポート
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
