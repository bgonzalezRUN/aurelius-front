import { useCallback, useEffect, useState } from 'react';
import RequisitionList from '../components/RequisitionList';
import RequisitionModal from '../components/RequisitionModal';
import Restricted from '../components/Restricted';
import { PlusIcon, File } from 'lucide-react';
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
import { H1 } from '../components/common/Text';
import { Search } from '../components/common/Search';
import { useCostCenterById } from '../api/queries/costCenterQuery';
import { useParams } from 'react-router-dom';

export default function RequisitionsPage() {
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const { data: cc } = useCostCenterById(id || '');
  const [view, setView] = useState<ViewValue>(VIEW.LIST);
  const { data: categoriesData } = useCategories();
  const [filters, setFilters] = useState<string[]>([]);
  const [currentPage, setPageInUrl] = useUrlPagination('page');
  const [offset, setOffset] = useState<number>(1);
  const { isLoading, data } = useRequisitions({
    categories: filters.map(filter => getLeadingNumber(filter)).join(','),
    offset,
    limit: 50,
    costCenterId: Number(id)
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
        <div className="flex justify-between flex-none mb-2 items-center gap-x-4">
          <H1>
            <File size={28} />
            {`Listado de requisiciones de ${capitalizeWords(cc?.costCenterName || '')}`}
          </H1>

          <Restricted permission="create:requisition">
            <button
              onClick={() => setShowModal(true)}
              className="bg-white flex items-center rounded-lg shadow border border-primaryDark group ml-auto h-11 flex-none"
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
          <Search value="" onChange={() => {}} disabled />
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
