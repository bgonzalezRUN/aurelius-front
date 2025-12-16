import { type ReactNode } from 'react';

export const Header = ({ tableHeaders }: { tableHeaders: string[] }) => {
  if (!tableHeaders.length) return null;
  return (
    <div className={`grid grid-cols-${tableHeaders.length} gap-2 mb-2 px-4`}>
      {tableHeaders.map(header => (
        <div
          key={header}
          className="text-grey-600 font-bold text-lg  text-left "
        >
          {header}
        </div>
      ))}
    </div>
  );
};

export const Row = ({ content, numberColumns }: { content: ReactNode[], numberColumns:number }) => {
  if (!content.length) return null;
  
  
  return (
    <div className="space-y-2">
      {content.map((item, index) => (
        <div
          key={index}
          className={`grid grid-cols-${numberColumns} gap-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4`}
        >
          {Array.isArray(item) ? (
            item.map((cell, cellIndex) => (
              <div key={cellIndex} className="flex items-center">
                {cell}
              </div>
            ))
          ) : (
            <div className="text-grey-900 text-sm col-span-4">{item}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function ListWrap({
  tableHeaders,
  content,
}: {
  tableHeaders: string[];
  content: ReactNode[];
}) {
  if (!content.length || !tableHeaders.length) return null;
  return (
    <div className="w-full">
      <Header tableHeaders={tableHeaders} />

      <Row content={content} numberColumns={tableHeaders.length}/>
    </div>
  );
}
