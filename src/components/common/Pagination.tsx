// src/components/PaginationControls.tsx

import { type FC } from 'react';
import type { PaginationData } from '../../types/pagination';
import { generatePageNumbers } from '../../utils';

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: FC<PaginationProps> = ({
  pagination,
  onPageChange,
  isLoading = false,
}) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const pageNumbers = generatePageNumbers(currentPage, totalPages);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-2">
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-semibold">{startItem}</span> al{' '}
        <span className="font-semibold">{endItem}</span> de{' '}
        <span className="font-semibold">{totalItems}</span> resultados
      </div>

      <nav className="flex items-center space-x-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage || isLoading}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>

        <div className="flex space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={index} className="px-3 py-1 text-sm text-gray-700">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition duration-150 ease-in-out ${
                  page === currentPage
                    ? 'text-white bg-primary-primary'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage || isLoading}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </nav>
    </div>
  );
};


