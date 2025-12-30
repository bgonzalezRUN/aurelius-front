import { useMemo } from 'react';
import { Check, Layers, UserRoundCheck } from 'lucide-react';
import { useRequisitionById } from '../api/queries/requisitionQueries';
import { Dialog, Loading } from './common';
import { useCostCenterById } from '../api/queries/costCenterQuery';
import { useParams } from 'react-router-dom';
import { dateformatter, fmtTime } from '../utils';

import { ROLEITEMNAME, type TimeWindow } from '../types';
import { Table } from './common/Table';

export interface DecodedSignature {
  requisition_id: number;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
}

export default function RequisitionDetailModal({
  open,
  onClose,
  requisitionId,
}: {
  open: boolean;
  onClose: () => void;
  requisitionId: string;
}) {
  const { data, isLoading } = useRequisitionById(requisitionId);
  const { costCenterId } = useParams();

  const { data: costCenterData } = useCostCenterById(costCenterId || '');

  const decodeSignature = (
    signatureBase64?: string
  ): DecodedSignature | null => {
    if (!signatureBase64) return null;

    try {
      const decodedJson = atob(signatureBase64);
      return JSON.parse(decodedJson);
    } catch (err) {
      console.error('Error decoding signature:', err);
      return null;
    }
  };

  const approvals = useMemo(() => {
    const signature = decodeSignature(data?.approver);

    return [
      {
        interestedParty: ROLEITEMNAME.RFR,
        exists: data?.requester,
        name: data?.requester?.name,
        date: data?.requester?.timestamp || '',
      },
      {
        interestedParty: ROLEITEMNAME.GO,
        exists: data?.validator,
        name: data?.validator?.name,
        date: data?.validator?.timestamp || '',
      },
      {
        interestedParty: ROLEITEMNAME.DO,
        exists: signature,
        name: signature?.user,
        date: signature?.timestamp || '',
      },
    ];
  }, [data?.approver, data?.requester, data?.validator]);

  const columns = [
    { header: 'Material', key: 'material' },
    { header: 'Unidad', key: 'metricUnit' },
    { header: 'Cantidad', key: 'quantity' },
  ];

  if (!open || !data) return null;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Dialog
        isOpen
        onClose={onClose}
        title={`Detalle de la requisición ${data.requisitionCode}`}
      >
        <div className="flex flex-col gap-y-3">
          <section className="flex flex-col gap-y-2">
            <h2 className="text-lg font-bold text-primaryDark inline-flex items-center gap-x-2">
              <span className="font-bold text-base text-grey-100">
                Proyecto:
              </span>
              {costCenterData?.costCenterName}
            </h2>

            <div className="flex justify-between items-center">
              <p className="font-bold text-primaryDark inline-flex items-center gap-x-2">
                <span className="font-bold text-grey-100">
                  Fecha de llegada:
                </span>
                <span>{dateformatter(data.arrivalDate || '')}</span>
              </p>

              <div>
                {Array.isArray(data.arrivalWindows) &&
                  data.arrivalWindows.length > 0 && (
                    <>
                      {data.arrivalWindows.map((w: TimeWindow, i: number) => (
                        <span
                          key={i}
                          className="text-xs text-black px-2 py-0.5 rounded-md border border-[#01687d]"
                        >
                          {fmtTime(w.start)} – {fmtTime(w.end)}
                        </span>
                      ))}
                    </>
                  )}
              </div>
            </div>

            {data.sendTo.length ? (
              <div>
                <span className="font-bold text-grey-100">
                  Proveedores sugeridos
                </span>{' '}
                {data.sendTo?.map((s, i) => (
                  <span
                    key={i}
                    className="ml-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <section>
            <h3 className="text-lg font-bold text-primaryDark mb-2 inline-flex gap-x-2">
              <Layers />
              Materiales
            </h3>

            <Table data={data.items} columns={columns} />
          </section>

          <section>
            <h3 className="text-lg font-bold text-primaryDark mb-2 inline-flex gap-x-2">
              <UserRoundCheck />
              Aprobaciones
            </h3>

            <div className="flex justify-between gap-x-4">
              {approvals.map(({ interestedParty, exists, name, date }) => (
                <div
                  key={name}
                  className="p-5 border rounded-xl bg-[#f8fafa] shadow-sm flex flex-col items-start justify-between max-w-[calc(100%/3)] w-full min-w-0"
                >
                  <p className="font-semibold text-[#01687d] text-sm w-full truncate">
                    {interestedParty}
                  </p>

                  {!exists ? (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      ⛔ <span>No solicitada</span>
                    </p>
                  ) : (
                    <div className="w-full">
                      <p className="text-sm text-green-700 flex items-center gap-1 w-full">
                        <Check className="flex-shrink-0" />
                        <strong className="truncate block">{name}</strong>
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(date).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </Dialog>
    </>
  );
}
