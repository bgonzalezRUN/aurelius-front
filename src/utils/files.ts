export const groupBy = <T, K extends keyof T>(collection: T[], key: K) => {
  return collection.reduce((acc, current) => {
    // Obtenemos el valor de la propiedad que será nuestra llave (convertido a string)
    const groupKey = String(current[key]);

    // Si el grupo no existe, inicializamos el array
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }

    // Insertamos el objeto actual en su grupo
    acc[groupKey].push(current);

    return acc;
  }, {} as Record<string, T[]>);
};