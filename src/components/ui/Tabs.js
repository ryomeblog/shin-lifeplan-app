import React, { useState } from 'react';
import clsx from 'clsx';

const Tabs = ({
  tabs = [],
  defaultTab = 0,
  onChange,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  const baseClasses = 'flex';
  const variantClasses = {
    default: 'border-b border-gray-200',
    pills: 'bg-gray-100 rounded-lg p-1',
    underline: '',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const getTabClasses = (index, isActive) => {
    const baseTabClasses =
      'px-4 py-2 font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';

    if (variant === 'pills') {
      return clsx(
        baseTabClasses,
        'rounded-md',
        isActive
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      );
    }

    if (variant === 'underline') {
      return clsx(
        baseTabClasses,
        'border-b-2 -mb-px',
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      );
    }

    // default variant
    return clsx(
      baseTabClasses,
      'border-b-2 -mb-px',
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
    );
  };

  return (
    <div className={className} {...props}>
      {/* タブヘッダー */}
      <div className={clsx(baseClasses, variantClasses[variant], sizeClasses[size])}>
        {tabs.map((tab, index) => (
          <button
            key={tab.key || index}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
            className={clsx(getTabClasses(index, activeTab === index), {
              'opacity-50 cursor-not-allowed': tab.disabled,
            })}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="mt-4">{tabs[activeTab]?.content}</div>
    </div>
  );
};

export default Tabs;
