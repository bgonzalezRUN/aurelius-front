import { useCallback, useEffect, useState } from 'react';
import { Building2, PlusIcon } from 'lucide-react';
import { H1 } from '../components/common/Text';
import ButtonWithIcon from '../components/common/ButtonWithIcon';
import CCList from '../components/costCenter/CCList';
import CreationForm from '../components/costCenter/CreationForm';
import { useCostCenter } from '../api/queries/costCenterQuery';
import { VIEW, type ViewValue } from '../types/view';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Pagination } from '../components/common/Pagination';
import { useUrlPagination } from '../hooks/useUrlPagination';
import { Search } from '../components/common/Search';

export default function CostCenter() {
  const [offset, setOffset] = useState<number>(1);
  const [query, setQuery] = useState<string>('');
  const { isLoading, data } = useCostCenter({ limit: 50, offset, search: query, });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [view, setView] = useState<ViewValue>(VIEW.CARD);
  const [currentPage, setPageInUrl] = useUrlPagination('page');

  useEffect(() => {
    const itemsPerPage = data?.itemsPerPage || 50;
    setOffset(currentPage * itemsPerPage - itemsPerPage || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleOpenModal = useCallback(() => {
    setShowModal(value => !value);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || isLoading) return;
      setPageInUrl(page);
    },
    [currentPage, isLoading, setPageInUrl]
  );

  const handleChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  return (
    <>
      <div className="flex flex-col h-full max-h-screen gap-y-5">
        <div className="flex justify-between flex-none">
          <H1>
            <Building2 size={28} />
            Centro de costos
          </H1>

          <ButtonWithIcon
            onClick={handleOpenModal}
            icon={<PlusIcon />}
            label="Nuevo CC"
          />
        </div>
        <div className="flex gap-x-4 items-center flex-none justify-between">
          <Search
            value={query}
            onChange={handleChange}
            disabled={!data?.data.length && !query}
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
          <CCList viewType={view} isLoading={isLoading} data={data?.data} />
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
      {showModal && (
        <CreationForm isOpen={showModal} onClose={handleOpenModal} />
      )}
    </>
  );
}
