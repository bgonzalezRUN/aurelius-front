import  { type ReactNode } from "react";


interface Column<T> {
  header: string;
  key: keyof T | string; 
  render?: (item: T, index: number) => ReactNode; 
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  maxHeight?: string; 
}

export const Table = <T extends Record<string, unknown>>({
  data,
  columns,
  maxHeight = "calc(100vh - 518px)",
}: TableProps<T>) => {
  return (
    <div className="border rounded-lg shadow-sm overflow-hidden">      
      <div 
        className="overflow-y-auto" 
        style={{ maxHeight }}
      >
        <table className="w-full text-sm">
          {/* Encabezado fijo */}
          <thead className="bg-[#b3b3b3] text-black border-b sticky top-0 z-10">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="p-2 text-left font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t hover:bg-[#f7fcfd] transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-2">                     
                      {col.render 
                        ? col.render(item, rowIndex) 
                        : (item[col.key as keyof T] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                  No hay datos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};