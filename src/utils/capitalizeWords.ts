export function capitalizeWords(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
