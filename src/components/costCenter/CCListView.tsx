import { useMemo } from 'react';
import { useCostCenterById } from '../../api/queries/costCenterQuery';
import { Row } from '../common/ListWrap';
import { Building2 } from 'lucide-react';

export default function CCListView({ costCenterId }: { costCenterId: string }) {
  const { data } = useCostCenterById(costCenterId);

  const content = useMemo(() => {
    if (!data) return [];
    return [
      <p className="text-secondary font-bold inline-flex gap-x-1 items-center">
        <Building2 size={20} />
        {data?.costCenterCode}</p>,
      <p className="text-secondary font-bold">{data?.costCenterName}</p>,
      <p className="text-grey-primary font-bold">
        {data?.costCenterDescription}
      </p>,
      <p className="text-grey-primary font-bold">
        {data?.requisitions?.length}
      </p>,
    ];
  }, [data]);

  if (!data) return null;

  return <Row content={[content]} numberColumns={4} />;
}
