
export const generatePageNumbers = (currentPage: number, totalPages: number): (number | '...')[] => {
  const maxPagesToShow = 5;
  const pageNumbers: (number | '...')[] = [];

  if (totalPages <= maxPagesToShow + 2) {
    // Caso 1: Pocas páginas, mostrar todas.
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  // Caso 2: Muchas páginas, usar puntos suspensivos (...)
  const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2) + 1);
  const endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPagesToShow / 2) - 1);

  pageNumbers.push(1); // Siempre mostrar la primera página

  if (startPage > 2) {
    pageNumbers.push('...');
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages - 1) {
    pageNumbers.push('...');
  }

  pageNumbers.push(totalPages); // Siempre mostrar la última página

  return Array.from(new Set(pageNumbers)); // Eliminar duplicados si los hay
};