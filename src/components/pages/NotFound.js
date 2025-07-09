import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">ページが見つかりません</h2>
          <p className="text-gray-600 mt-2">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </div>
        <div className="space-y-4">
          <Link to="/">
            <Button size="lg" className="w-full">
              ホームに戻る
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg" className="w-full">
              ダッシュボードに移動
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
