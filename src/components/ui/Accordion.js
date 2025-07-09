import React, { useState } from 'react';
import clsx from 'clsx';
import { HiChevronDown } from 'react-icons/hi2';

const AccordionItem = ({
  title,
  children,
  isOpen = false,
  onToggle,
  disabled = false,
  icon = null,
  rightContent = null,
}) => {
  const headerClasses = clsx(
    'flex items-center justify-between w-full px-4 py-3 text-left bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors duration-200',
    {
      'cursor-not-allowed opacity-50': disabled,
      'rounded-t-lg': isOpen,
      'rounded-lg': !isOpen,
    }
  );

  const contentClasses = clsx(
    'px-4 py-3 border-x border-b border-gray-200 bg-gray-50 rounded-b-lg',
    {
      block: isOpen,
      hidden: !isOpen,
    }
  );

  return (
    <div className="mb-2">
      <button
        onClick={() => !disabled && onToggle?.()}
        disabled={disabled}
        className={headerClasses}
      >
        <div className="flex items-center flex-1">
          {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}
          <span className="font-medium text-gray-900">{title}</span>
        </div>

        <div className="flex items-center space-x-2">
          {rightContent && <span className="text-sm text-gray-600">{rightContent}</span>}
          <HiChevronDown
            className={clsx('h-4 w-4 text-gray-500 transition-transform duration-200', {
              'transform rotate-180': isOpen,
            })}
          />
        </div>
      </button>

      <div className={contentClasses}>{children}</div>
    </div>
  );
};

const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpenItems = [],
  className = '',
  ...props
}) => {
  const [openItems, setOpenItems] = useState(new Set(defaultOpenItems));

  const handleToggle = (index) => {
    const newOpenItems = new Set(openItems);

    if (allowMultiple) {
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
    } else {
      if (newOpenItems.has(index)) {
        newOpenItems.clear();
      } else {
        newOpenItems.clear();
        newOpenItems.add(index);
      }
    }

    setOpenItems(newOpenItems);
  };

  return (
    <div className={clsx('space-y-0', className)} {...props}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.key || index}
          title={item.title}
          icon={item.icon}
          rightContent={item.rightContent}
          disabled={item.disabled}
          isOpen={openItems.has(index)}
          onToggle={() => handleToggle(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
