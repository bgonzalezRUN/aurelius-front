import { Check, CircleX, Eye, Layers, Trash2 } from 'lucide-react';
import { useRequisitionById } from '../api/queries/requisitionQueries';
import { Loading } from './common';
import { useCostCenterById } from '../api/queries/costCenterQuery';
import { useParams } from 'react-router-dom';
import { dateformatter, fmtTime } from '../utils';

import type { TimeWindow } from '../types';
import { useRequisitionMutations } from '../api/queries/requisitionMutations';
import { usePopupStore } from '../store/popup';
import { useEffect } from 'react';

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
  const { openPopup: openPopupValidate } = usePopupStore();
  const { deleteReq } = useRequisitionMutations();
  const { data: costCenterData } = useCostCenterById(costCenterId || '');

  useEffect(() => {
    if (deleteReq.isSuccess) {
      onClose();
    }
  }, [deleteReq.isSuccess, onClose]);

  if (!open || !data) return null;

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

  const onConfirmDelete = () => {
    openPopupValidate({
      title: 'Confirmar eliminación',
      message: `¿Estas seguro que quieres eliminar la requisición ${data.requisitionCode}?`,
      onConfirm: () => deleteReq.mutate(data.requisitionId),
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[800px] max-h-[90vh] border border-[#e0e0e0]">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b bg-white text-[#01687d] rounded-t-lg">
          <div className="flex items-center gap-2">
            <Eye />
            <h2 className="text-2xl text-black font-bold">
              Detalle de Requisición
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onConfirmDelete}
              className="px-2 py-2 rounded-lg  hover:bg-red-300 text-gray-800 transition"
            >
              <Trash2 />
            </button>
            <button
              onClick={onClose}
              className="px-2 py-2 rounded-lg  hover:bg-gray-300 text-gray-800 transition"
            >
              <CircleX />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {/* Información general */}
          <section className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col justify-between items-start mb-1">
                  <span className="font-semibold text-base text-black">
                    Proyecto:
                  </span>{' '}
                  <h2 className="text-lg font-bold text-[#01687d] leading-tight">
                    {costCenterData?.costCenterName}
                  </h2>
                </div>

                <div className="col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-semibold text-base text-black">
                      Fecha de llegada:
                    </span>
                    <span>{dateformatter(data.arrivalDate || '')}</span>
                  </div>

                  <div className="flex flex-col justify-end sm:flex-row sm:items-center sm:gap-2">
                    {Array.isArray(data.arrivalWindows) &&
                      data.arrivalWindows.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {data.arrivalWindows.map(
                            (w: TimeWindow, i: number) => (
                              <span
                                key={i}
                                className="text-xs text-black px-2 py-0.5 rounded-md border border-[#01687d]"
                              >
                                {fmtTime(w.start)} – {fmtTime(w.end)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
              {data.sendTo.length ? (
                <div className="col-span-2">
                  <span className="font-semibold text-base text-black">
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
            </div>
          </section>

          {/* Materiales */}
          <section className="mb-6">
            <div className="flex items-center text-[#01687d] gap-2">
              <Layers />
              <h3 className="text-lg font-bold text-[#01687d] mb-2">
                Materiales
              </h3>
            </div>

            <div className="border rounded-lg shadow-sm overflow-hidden">
              {/* Scroll SOLO en la tabla */}
              <div className="max-h-[calc(100vh-518px)] overflow-y-auto">
                <table className="w-full text-sm">
                  {/* Encabezado fijo */}
                  <thead className="bg-[#b3b3b3] text-black border-b sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left">Material</th>
                      <th className="p-2 text-left">Unidad</th>
                      <th className="p-2 text-left">Cantidad</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.items?.map((it, i) => (
                      <tr
                        key={i}
                        className="border-t hover:bg-[#f7fcfd] transition"
                      >
                        <td className="p-2">{it.material}</td>
                        <td className="p-2">{it.metricUnit}</td>
                        <td className="p-2">{it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Firmas */}
          <h3 className="text-md font-semibold text-[#058cb5] mb-2">
            Aprobaciones
          </h3>
          <section className="flex flex-row gap-2 justify-around mb-8">
            {/* BLOQUE 1 */}
            <div className="p-5 h-[100px] border rounded-xl bg-[#f8fafa] shadow-sm mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#01687d] text-sm">
                  Solicitante
                </p>

                {!data.requester ? (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    ⛔ <span>No solicitada</span>
                  </p>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-green-700 flex items-center gap-1">
                      <Check />
                      <strong>{data.requester.name}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(data.requester.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BLOQUE 2 */}
            <div className="p-5 h-[100px] border rounded-xl bg-[#f8fafa] shadow-sm mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#01687d] text-sm">
                  Gerente de obra
                </p>

                {!data.validator ? (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    ⛔ <span>No validada</span>
                  </p>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-green-700 flex items-center gap-1">
                      <Check />
                      <strong>{data.validator.name}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(data.validator.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* BLOQUE 3 */}
            <div className="p-5 h-[100px] border rounded-xl bg-[#f8fafa] shadow-sm mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#01687d] text-sm">
                  Director de obra
                </p>

                {(() => {
                  const signature = decodeSignature(data.approver);

                  if (!signature) {
                    return (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        ⛔ <span>No firmada</span>
                      </p>
                    );
                  }

                  return (
                    <div className="mt-2">
                      <p className="text-sm text-green-700 mt-1 flex items-center gap-1">
                        <Check />
                        <strong>{signature.user}</strong>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(signature.timestamp).toLocaleString()}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
