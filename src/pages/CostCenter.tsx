import { useCallback, useState } from 'react';
import { Building2, PlusIcon } from 'lucide-react';
import { H1 } from '../components/common/Text';
import ButtonWithIcon from '../components/common/ButtonWithIcon';
import CCList from '../components/costCenter/CCList';
import CreationForm from '../components/costCenter/CreationForm';
import { useCostCenter } from '../api/queries/costCenterQuery';
import { VIEW, type ViewValue } from '../types/view';
import { SegmentedControl } from '../components/common/SegmentedControl';

export default function CostCenter() {
  const { isLoading, data } = useCostCenter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [view, setView] = useState<ViewValue>(VIEW.CARD);

  const handleOpenModal = useCallback(() => {
    setShowModal(value => !value);
  }, []);

  return (
    <div className="flex flex-col h-full max-h-screen gap-y-5">
      <div className="flex justify-between">
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
      <div className="flex gap-x-4 items-center flex-none">
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

      {showModal && (
        <CreationForm isOpen={showModal} onClose={handleOpenModal} />
      )}
    </div>
  );
}
