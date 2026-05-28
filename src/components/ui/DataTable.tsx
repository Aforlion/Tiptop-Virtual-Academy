import React from 'react';

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, emptyMessage = 'No data available.' }: DataTableProps<T>) {
  return (
    <div className="premium-table-container">
      <table className="premium-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index}
                style={{ 
                  textAlign: col.align || 'left',
                  width: col.width
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                style={{ 
                  textAlign: 'center', 
                  color: 'hsl(var(--text-muted))', 
                  padding: '2rem' 
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
