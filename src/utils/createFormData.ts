/**
 * Convierte un objeto genérico en FormData de forma tipada.
 * Los arrays de objetos se envían como un string JSON.
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
      const containsObjects = value.some(
        (item) => typeof item === 'object' && item !== null && !(item instanceof File)
      );

      if (containsObjects) {
        formData.append(String(key), JSON.stringify(value));
      } else {        
        value.forEach((item) => {
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
      }
    } else if (typeof value === 'object') {    
      formData.append(String(key), JSON.stringify(value));
    } else {
      formData.append(String(key), String(value));
    }
  });

  return formData;
};