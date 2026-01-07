/**
 * Convierte un objeto genérico en FormData de forma tipada.
 * @template T - El tipo del objeto, debe ser un registro de clave-valor.
 */
export const createFormData = <T extends Record<string, unknown>>(
  data: T
): FormData => {
  const formData = new FormData();

  (Object.entries(data) as [keyof T, T[keyof T]][]).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (value instanceof File) {
      formData.append(String(key), value, value.name);
    } else if (Array.isArray(value)) {
      value.forEach(item => {
        if (item instanceof File) {
          formData.append(String(key), item, item.name);
        } else if (
          typeof item === 'string' ||
          typeof item === 'number' ||
          typeof item === 'boolean'
        ) {
          formData.append(String(key), String(item));
        }
      });
    } else {
      formData.append(String(key), String(value));
    }
  });

  return formData;
};
