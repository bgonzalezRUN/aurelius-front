/**
 * Elimina propiedades de un objeto usando rutas (ej. 'paymentTerms.paymentTermId')
 */
export function omitFields<T>(obj: T, paths: string[]): T {
  if (typeof obj !== 'object' || obj === null) return obj;
  const result = JSON.parse(JSON.stringify(obj));

  paths.forEach(path => {
    const parts = path.split('.');   
 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removePath = (currentObj: any, pathParts: string[]) => {
      const [currentPart, ...remainingParts] = pathParts;

      if (!currentObj || !currentObj[currentPart]) return;

      if (remainingParts.length === 0) {
        
        delete currentObj[currentPart];
      } else {
        const nextTarget = currentObj[currentPart];
        
        if (Array.isArray(nextTarget)) {
         
          nextTarget.forEach(item => removePath(item, remainingParts));
        } else {
          
          removePath(nextTarget, remainingParts);
        }
      }
    };

    removePath(result, parts);
  });

  return result as T;
}