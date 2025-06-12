import React from 'react';
import clsx from 'clsx';

const Card = ({
  children,
  title = '',
  subtitle = '',
  actions = null,
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const cardClasses = clsx(
    baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    {
      'border border-gray-200': border,
      'hover:shadow-md hover:scale-[1.02] cursor-pointer': hover,
      'hover:shadow-lg': hover && shadow === 'sm',
      'hover:shadow-xl': hover && shadow === 'md',
    },
    className
  );

  const CardContent = () => (
    <>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      {children}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={clsx(cardClasses, 'text-left w-full')} {...props}>
        <CardContent />
      </button>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      <CardContent />
    </div>
  );
};

export default Card;
