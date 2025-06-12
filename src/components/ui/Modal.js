import React, { useEffect } from 'react';
import clsx from 'clsx';
import { HiXMark } from 'react-icons/hi2';

const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  footer = null,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // ボディのスクロールを無効にする
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* モーダルコンテナ */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={clsx(
            'relative bg-white rounded-lg shadow-xl transform transition-all',
            sizeClasses[size],
            'w-full',
            className
          )}
          {...props}
        >
          {/* ヘッダー */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* コンテンツ */}
          <div className="p-4">{children}</div>

          {/* フッター */}
          {footer && (
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
