import { Boxes } from 'lucide-react';
import { H1 } from '../components/common/Text';
import { Search } from '../components/common/Search';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SupplierList from '../components/suppliers/SupplierList';
import { useSupplier } from '../api/queries/supplierQueries';
import { capitalizeWords, getLeadingNumber } from '../utils';
import { useUrlPagination } from '../hooks/useUrlPagination';
import { Loading } from '../components/common';
import { Pagination } from '../components/common/Pagination';
import { MultiSelectFilter } from '../components/common/MultiSelectFilter';
import { useCategories } from '../api/queries/requisitionQueries';
import { CATEGORYITEM } from '../types/category';

export default function Supplier() {
  const [query, setQuery] = useState<string>('');
  const { data: categoriesData } = useCategories();
  const [filters, setFilters] = useState<Record<string, string[]>>({
    status: [],
    categories: [],
  });
  const [currentPage, setPageInUrl] = useUrlPagination('page');
  const [offset, setOffset] = useState<number>(1);
  const { isLoading, data } = useSupplier({
    categories: filters.categories
      .map(filter => getLeadingNumber(filter))
      .join(','),
    offset,
    limit: 50,
    search: query,
    status: filters.status.map(filter => filter).join(','),
  });
  const handleChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  useEffect(() => {
    const itemsPerPage = data?.itemsPerPage || 50;
    setOffset(currentPage * itemsPerPage - itemsPerPage || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || isLoading) return;
      setPageInUrl(page);
    },
    [currentPage, isLoading, setPageInUrl]
  );

  const handleFilterChange = useCallback(
    (newFilters: Record<string, string[]>) => {
      setFilters(newFilters);
    },
    []
  );
  const filterGroups = useMemo(() => {
    return [
      {
        id: 'categories',
        label: 'Categorías',
        options:
          categoriesData?.map(({ categoryName, categoryId }) => ({
            value: `${categoryId}${categoryName}`,
            label: capitalizeWords(CATEGORYITEM[Number(categoryId)]),
          })) ?? [],
      },
    ];
  }, [categoriesData]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col h-full max-h-screen gap-y-5">
        <div className="flex justify-between flex-none mb-2 items-center gap-x-4">
          <H1>
            <Boxes size={28} />
            Proveedores
          </H1>
        </div>
        <div className="flex gap-x-4 items-center flex-none">
          <Search
            value={query}
            onChange={handleChange}
            disabled={!data?.data?.length && !query}
          />
          <MultiSelectFilter
            groups={filterGroups}
            selectedValues={filters}
            onValuesChange={handleFilterChange}
          />
        </div>

        <div className="overflow-y-auto flex-1">
          <SupplierList data={data?.data ?? []} />
        </div>

        <div className="mt-auto px-2 flex-none">
          <Pagination
            pagination={{
              currentPage: data?.currentPage || 0,
              totalPages: data?.totalPages || 0,
              totalItems: data?.totalItems || 0,
              itemsPerPage: data?.itemsPerPage || 0,
            }}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
