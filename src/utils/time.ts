export const fmtTime = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso))
    : '';

export const toInputTime = (isoString: string) => {
  const d = new Date(isoString);

  const hours = String(d.getHours()).padStart(2, '0');   
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};
