import RequisitionCard from './requisition/RequisitionCard';
import { useRequisitions } from '../api/queries/requisitionQueries';
import { Loading } from './common';

export default function RequisitionList() {
  const { data, isLoading } = useRequisitions();

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
