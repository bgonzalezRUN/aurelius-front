import { type FC, type ReactNode, Fragment } from 'react';
import { Dialog } from '../common';
import { capitalizeWords } from '../../utils';
import type { HistoryRequisition, Status } from '../../types';
import { dateformatter } from '../../utils/dateformatter';
import HistoryStatus from './HistoryStatus';
import clsx from 'clsx';
import { useRequisitionHistory } from '../../api/queries/requisitionQueries';
import { useParams } from 'react-router-dom';
import { useCostCenterById } from '../../api/queries/costCenterQuery';

interface OrderHistoryProps {
  isPopupOpen: boolean;
  closePopup: () => void;
  requisitionId: string;
}

const OrderHistory: FC<OrderHistoryProps> = ({
  isPopupOpen,
  closePopup,
  requisitionId,
}) => {
  const { data: history } = useRequisitionHistory(requisitionId);
  const { costCenterId } = useParams();
  const { data } = useCostCenterById(costCenterId || '');

  const tableHeaders = ['Fecha', 'Usuario', 'Acción'];
  const labels: (keyof HistoryRequisition)[] = [
    'createdAt',
    'historyUser',
    'historyAction',
  ];

  const labelRenderers: Partial<
    Record<keyof HistoryRequisition, (value: string) => ReactNode>
  > = {
    createdAt: value => (
      <p className="text-grey-100 font-normal text-base">
        {dateformatter(value)}
      </p>
    ),
    historyUser: value => (
      <p className="text-grey-100 font-normal text-base">{value}</p>
    ),
    historyAction: value => <HistoryStatus status={value as Status} />,
  };

  return (
    <Dialog
      isOpen={isPopupOpen}
      onClose={closePopup}
      title="Histórico de Requisición"
    >
      <p className="text-grey-100 font-medium text-base mb-4">
        Consulta los movimientos de aprobación y comentarios registrados
      </p>

      <h3 className="text-secondary text-xl font-extrabold mb-3">
        {capitalizeWords(data?.costCenterName || '')}
      </h3>

      {history?.length ? (
        <>
          <div
            className={clsx(
              'h-9 bg-grey-200 rounded-[10px] p-2 flex items-center justify-around mb-2 w-[calc(100%-0.5rem)]',
              history.length >= 3 && 'w-[calc(100%-1.5rem)]'
            )}
          >
            {tableHeaders.map(header => (
              <span
                key={header}
                className="text-grey-100 font-extrabold text-base inline-block"
              >
                {header}
              </span>
            ))}
          </div>
          <div className="max-h-[305px] overflow-y-auto pr-2">
            <div className="flex flex-col gap-y-2">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="h-24 w-full border border-grey-primary rounded-[10px] py-2 px-9"
                >
                  <div className="flex items-center justify-between mb-2">
                    {labels.map(label => (
                      <Fragment key={label}>
                        {labelRenderers[label]?.(String(item[label]))}
                      </Fragment>
                    ))}
                  </div>
                  <div>
                    <p className="font-extrabold text-base text-grey-100">
                      Comentarios
                    </p>
                    <p
                      className="text-grey-100 font-normal text-base truncate"
                      title={item['historyObservation'] ?? 'Sin observaciones.'}
                    >
                      {item['historyObservation'] ?? 'Sin observaciones.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="font-extrabold text-base text-grey-100">
          No hay historial disponible para esta requisición.
        </p>
      )}
    </Dialog>
  );
};

export default OrderHistory;
