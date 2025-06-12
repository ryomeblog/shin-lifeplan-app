import React from 'react';
import clsx from 'clsx';

const CurrencyDisplay = ({
  amount = 0,
  currency = 'JPY',
  showSign = true,
  size = 'md',
  colorByValue = true,
  className = '',
  ...props
}) => {
  const formatAmount = (value) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const getColorClasses = () => {
    if (!colorByValue) return 'text-gray-900';

    if (amount > 0) {
      return 'text-green-600'; // 収入・利益
    } else if (amount < 0) {
      return 'text-red-600'; // 支出・損失
    } else {
      return 'text-gray-600'; // ゼロ
    }
  };

  const displayClasses = clsx('font-medium', sizeClasses[size], getColorClasses(), className);

  const getSignPrefix = () => {
    if (!showSign) return '';
    if (amount > 0) return '+';
    return ''; // 負の場合は通貨フォーマットで自動的に-が付く
  };

  return (
    <span className={displayClasses} {...props}>
      {getSignPrefix()}
      {formatAmount(amount)}
    </span>
  );
};

export default CurrencyDisplay;
