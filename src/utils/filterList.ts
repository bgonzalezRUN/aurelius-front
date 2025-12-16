/* eslint-disable @typescript-eslint/no-explicit-any */
export function filterList<T extends object>(
  list: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return list;

  function searchValue(value: any): boolean {
    if (value === undefined || value === null) return false;

    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.values(value).some(searchValue);
    }

    if (Array.isArray(value)) {
      return value.some(searchValue);
    }

    return String(value).toLowerCase().includes(normalizedQuery);
  }

  return list.filter(item =>
    fields.some(field => {
      const rawValue = item[field];
      return searchValue(rawValue);
    })
  );
}
