export const trimValue = <T>(value: T): T => {
  if (typeof value === 'string') {
    return value.trim() as unknown as T;
  }
  return value;
};