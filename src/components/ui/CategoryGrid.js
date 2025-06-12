import React from 'react';
import clsx from 'clsx';

const CategoryGrid = ({
  categories = [],
  selectedCategory = null,
  onCategorySelect,
  columns = 3,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-16 text-sm',
    md: 'h-20 text-base',
    lg: 'h-24 text-lg',
  };

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const getCategoryClasses = (category) => {
    const isSelected = selectedCategory === category.id;

    return clsx(
      'flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
      sizeClasses[size],
      {
        'border-blue-500 bg-blue-50 text-blue-700': isSelected,
        'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50':
          !isSelected,
        'opacity-50 cursor-not-allowed': category.disabled,
      }
    );
  };

  const getIconClasses = (category) => {
    const isSelected = selectedCategory === category.id;

    return clsx('w-8 h-8 rounded-full flex items-center justify-center mb-1', {
      'bg-blue-500 text-white': isSelected,
      'text-white': !isSelected,
    });
  };

  return (
    <div className={clsx('grid gap-3', gridClasses[columns], className)} {...props}>
      {categories.map((category, index) => (
        <button
          key={category.id || index}
          onClick={() => !category.disabled && onCategorySelect?.(category)}
          disabled={category.disabled}
          className={getCategoryClasses(category)}
        >
          <div
            className={getIconClasses(category)}
            style={{ backgroundColor: category.color || '#6b7280' }}
          >
            {category.icon && <span className="text-lg">{category.icon}</span>}
          </div>
          <span className="text-xs font-medium text-center leading-tight">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
