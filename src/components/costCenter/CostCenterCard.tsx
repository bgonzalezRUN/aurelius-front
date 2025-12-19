import { Building2 } from 'lucide-react';
import { useCostCenterById } from '../../api/queries/costCenterQuery';
import { capitalizeWords } from '../../utils';

export default function CostCenterCard({
  costCenterId,
}: {
  costCenterId: string;
}) {
  const { data } = useCostCenterById(costCenterId);
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition flex flex-col w-[300px] max-h-36">
      <div className="text-secondary flex gap-x-2 pb-2 mb-2 border-b border-b-grey-primary">
        <Building2 size={20} className="mt-2" />
        <div className="w-full overflow-hidden">
          <p className="font-bold line-clamp-2 leading-none mb-2">
            {data.costCenterCode}
            <br />
            {capitalizeWords(data.costCenterName)}
          </p>
          <p
            className="font-semibold text-grey-primary text-sm truncate"
            title={data.costCenterDescription}
          >
            {data.costCenterDescription}
          </p>
        </div>
      </div>
      <p
        className="font-semibold text-grey-primary text-xs truncate ml-6"
        title={data.costCenterDescription}
      >
        {`${data?.requisitions?.length} Requisiciones pendientes`}
      </p>
    </div>
  );
}
