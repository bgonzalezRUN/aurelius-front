export const getLeadingNumber = (str: string) => {
  const match = str.match(/^\d+/);
  return match ? Number(match[0]) : null;
};