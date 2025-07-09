import React from 'react';
import clsx from 'clsx';

const Table = ({
  columns = [],
  data = [],
  striped = true,
  hover = true,
  compact = false,
  className = '',
  onRowClick,
  ...props
}) => {
  const tableClasses = clsx('min-w-full divide-y divide-gray-200', className);

  const theadClasses = 'bg-gray-50';
  const thClasses = clsx(
    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    { 'px-3 py-2': compact }
  );

  const tbodyClasses = 'bg-white divide-y divide-gray-200';
  const getTrClasses = (index) =>
    clsx({
      'bg-gray-50': striped && index % 2 === 1,
      'hover:bg-gray-100 cursor-pointer': hover && onRowClick,
    });

  const tdClasses = clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900', {
    'px-3 py-2': compact,
  });

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses} {...props}>
        <thead className={theadClasses}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className={clsx(thClasses, column.headerClassName)}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={tbodyClasses}>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={getTrClasses(rowIndex)}
              onClick={() => onRowClick?.(row, rowIndex)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={`${rowIndex}-${column.key || colIndex}`}
                  className={clsx(tdClasses, column.className)}
                >
                  {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">データがありません</div>
      )}
    </div>
  );
};

export default Table;
