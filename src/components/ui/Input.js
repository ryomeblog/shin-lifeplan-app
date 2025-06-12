import React, { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(
  (
    {
      type = 'text',
      placeholder = '',
      value,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      error = false,
      helperText = '',
      label = '',
      required = false,
      size = 'md',
      icon = null,
      rightIcon = null,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'block w-full border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    const inputClasses = clsx(
      baseClasses,
      sizeClasses[size],
      stateClasses,
      {
        'pl-10': icon,
        'pr-10': rightIcon,
      },
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            className={inputClasses}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>
        {helperText && (
          <p className={clsx('mt-1 text-sm', error ? 'text-red-600' : 'text-gray-500')}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
