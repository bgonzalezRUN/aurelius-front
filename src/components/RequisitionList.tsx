import { useState } from 'react';
import RequisitionCard from './requisition/RequisitionCard';
import {
  useCategories,
  useRequisitions,
} from '../api/queries/requisitionQueries';
import { Loading } from './common';
import { capitalizeWords } from '../utils';
import { CATEGORYITEM } from '../types/category';
import { MultiSelectFilter } from './common/MultiSelectFilter';
import { getLeadingNumber } from '../utils/number';

export default function RequisitionList() {
  const { data: categoriesData } = useCategories();
  const [filters, setFilters] = useState<string[]>([]);
  const { data, isLoading } = useRequisitions({
    categories: filters.map(filter => getLeadingNumber(filter)).join(','),
    
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-[45vh] w-[65vw]">
        <p className="text-center text-5xl font-bold text-gray-500 italic">
          No hay requisiciones en este estado
        </p>
      </div>
    );

  return (
    <>
    <div className='w-2/5 ml-auto mb-10'>
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
    </div>
     
      <div className="flex flex-wrap gap-6">
        {data.map(r => (
          <RequisitionCard
            requisitionId={r.requisitionId || ''}
            key={r.requisitionCode}
          />
        ))}
      </div>
    </>
  );
}
