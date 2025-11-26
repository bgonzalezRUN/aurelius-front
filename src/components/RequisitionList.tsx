import RequisitionCard from './requisition/RequisitionCard';
import { useRequisitions } from '../api/queries/requisitionQueries';
import { Loading } from './common';
import { Fragment } from 'react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(r => (
          <Fragment key={r.requisitionCode}>            
            <RequisitionCard requisitionId={r.requisitionId} />
          </Fragment>
        ))}
      </div>
    </>
  );
}
