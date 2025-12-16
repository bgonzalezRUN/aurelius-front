import type { COST_CENTER } from '../../types/costCenter';
import { VIEW, type ViewValue } from '../../types/view';
import { Loading } from '../common';
import WithoutData from '../common/WithoutData';
import CostCenterCard from './CostCenterCard';
import { Header } from '../common/ListWrap';
import CCListView from './CCListView';

const tableHeaders = [
  'Centro de costos',
  'Nombre',
  'Descripción',
  'Requisiciones pendientes',
];

export default function CCList({
  viewType,
  data,
  isLoading,
}: {
  viewType: ViewValue;
  data?: Partial<COST_CENTER[]>;
  isLoading: boolean;
}) {
  if (!data || !data.length) {
    return <WithoutData message="No hay registros de centro de costos" />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (viewType === VIEW.LIST) {
    return (
      <div className="w-full space-y-2">
        <Header tableHeaders={tableHeaders} />
        {data.map((cc, index) => (
          <CCListView
            costCenterId={cc?.costCenterId || ''}
            key={cc?.costCenterId || index}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {data.map((cc, index) => (
        <CostCenterCard
          costCenterId={cc?.costCenterId || ''}
          key={cc?.costCenterId || index}
        />
      ))}
    </div>
  );
}
