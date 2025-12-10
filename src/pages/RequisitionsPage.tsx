import { useCallback, useEffect, useState } from 'react';
import RequisitionList from '../components/RequisitionList';
import RequisitionModal from '../components/RequisitionModal';
import Restricted from '../components/Restricted';
import { PlusIcon, Search } from 'lucide-react';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { MultiSelectFilter } from '../components/common/MultiSelectFilter';
import {
  useCategories,
  useRequisitions,
} from '../api/queries/requisitionQueries';
import { capitalizeWords } from '../utils';
import { CATEGORYITEM } from '../types/category';
import { VIEW, type ViewValue } from '../types/view';
import { getLeadingNumber } from '../utils/number';
import type { Requisition } from '../types';
import { Pagination } from '../components/common/Pagination';
import { useUrlPagination } from '../hooks/useUrlPagination';

export default function RequisitionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [view, setView] = useState<ViewValue>(VIEW.LIST);
  const { data: categoriesData } = useCategories();
  const [filters, setFilters] = useState<string[]>([]);
  const [currentPage, setPageInUrl] = useUrlPagination('page');
  const [offset, setOffset] = useState<number>(1);
  const { isLoading, data } = useRequisitions({
    categories: filters.map(filter => getLeadingNumber(filter)).join(','),
    offset,
    limit: 50
  });

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
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

  return (
    <>
      <div className="flex flex-col h-full max-h-screen gap-y-5">
        <div className="flex justify-between flex-none mb-2 items-center">
          <h1 className="text-3xl font-bold text-primaryDark">
            Listado de requisiciones
          </h1>
          <Restricted permission="create:requisition">
            <button
              onClick={() => setShowModal(true)}
              className="bg-white flex items-center rounded-lg shadow border border-primaryDark group ml-auto h-11"
            >
              <div className="bg-primaryDark text-white px-3 py-2 flex items-center justify-center group-hover:bg-primaryDark transition rounded-l-lg ">
                <span className="text-lg font-bold">
                  <PlusIcon />
                </span>
              </div>
              <span className="px-5 py-2 text-primaryDark font-medium group-hover:bg-gray-50 transition rounded-lg ">
                Nueva requisición
              </span>
            </button>
          </Restricted>
        </div>
        <div className="flex gap-x-4 items-center flex-none">
          <div className="flex gap-6 items-center">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Buscar"
                className="w-full bg-white drop-shadow-lg rounded-lg pl-10 pr-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryDark"
              />
            </div>
          </div>
          <MultiSelectFilter
            label="Filtrar por categorias"
            options={
              categoriesData?.map(({ categoryName, categoryId }) => ({
                value: `${categoryId}${categoryName}`,
                label: capitalizeWords(CATEGORYITEM[Number(categoryId)]),
              })) ?? []
            }
            onValuesChange={setFilters}
            selectedValues={filters}
          />
          <SegmentedControl
            options={[
              { label: 'Tarjetas', value: VIEW.CARD },
              { label: 'Mesa', value: VIEW.LIST },
            ]}
            value={view}
            onChange={setView}
          />
        </div>
        <div className="overflow-y-auto flex-1">
          <RequisitionList
            viewType={view}
            data={data?.data as Partial<Requisition[]>}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-4 px-2 flex-none">
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
      {showModal && (
        <RequisitionModal open={showModal} onClose={handleCloseModal} />
      )}
    </>
  );
}
