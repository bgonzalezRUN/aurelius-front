import {  useEffect, useState } from 'react';
import { getRequisitions, type Requisition } from '../api/requisitionService';
import { Eye, Edit, FileText } from 'lucide-react';
import { ButtonBase } from './common';

import OrderHistory from './requisition/OrderHistory';

export default function RequisitionList({
  onSelect,
  onEdit,
  onSend,
  onValidate,
  onApprove,
  filteredRequisitions,
}: {
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onSend: (id: string) => void;
  onValidate: (id: string) => void;
  onApprove: (id: string, user: string) => void;
  filteredRequisitions?: Requisition[];
}) {
  const [rows, setRows] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const ACTIONS_BY_STATUS: Record<
    string,
    { label: string; onClick?: (id: string, user: string) => void } | null
  > = {
    DRAFT: {
      label: 'Enviar a validación',
      onClick: id => onSend(id),
    },
    PENDING: {
      label: 'Confirmar requisición',
      onClick: id => onValidate(id),
    },
    VALIDATED: {
      label: 'Aprobar requisición',
      onClick: (id, user) => onApprove(id, user),
    },
    APPROVED: null,
    REJECTED: null,
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (filteredRequisitions !== undefined) {
          setRows(filteredRequisitions);
        } else {
          const data = await getRequisitions(status);
          setRows(data);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, filteredRequisitions]);

  const fmtDate = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(
          new Date(iso)
        )
      : '—';

  const fmtTime = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(iso))
      : '';

  const badge = (p: string) => {
    const base = 'px-2 py-0.5 rounded-lg text-xs font-medium';
    if (p === 'alta')
      return <span className={`${base} bg-red-100 text-red-700`}>Alta</span>;
    if (p === 'media')
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800`}>Media</span>
      );
    if (p === 'baja')
      return (
        <span className={`${base} bg-green-100 text-green-700`}>Baja</span>
      );
    return <span className={`${base} bg-gray-100 text-gray-700`}>{p}</span>;
  };

  const statusBadge = (p: string) => {
    const base = 'px-2 py-0.5 rounded-lg text-xs font-medium';
    if (p === 'DRAFT')
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>Borrador</span>
      );
    if (p === 'PENDING')
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800`}>
          Pendiente
        </span>
      );
    if (p === 'VALIDATED')
      return (
        <span className={`${base} bg-green-100 text-green-700`}>Validada</span>
      );
    if (p === 'APPROVED')
      return (
        <span className={`${base} bg-green-100 text-green-700`}>Aprobada</span>
      );
    if (p === 'REJECTED')
      return (
        <span className={`${base} bg-red-100 text-red-700`}>Rechazada</span>
      );
    return <span className={`${base} bg-gray-100 text-gray-700`}>{p}</span>;
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando…</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rows.length ? (
          rows.map(r => (
            <div
              key={r.requisitionId}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition flex flex-col"
            >
              {/* Título + Fecha */}
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-base font-semibold text-[#01687d] leading-tight">
                  {r.project}
                </h2>
                <span className="text-[12px] text-gray-600">
                  {fmtDate(r.arrivalDate)}
                </span>
              </div>

              {/* Proveedor */}

              {/* Prioridad + Ventana */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600 mb-2 leading-tight">
                  <span className="font-medium">Proveedor:</span>{' '}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.sendTo?.map(prov => (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                        {prov.name}
                      </span>
                    ))}
                  </div>
                </p>

                {Array.isArray((r as any).arrivalWindows) &&
                  (r as any).arrivalWindows.length > 0 && (
                    <div className="text-[12px] border border-[#01687d] text-black px-2 py-0.5 rounded-md">
                      {fmtTime((r as any).arrivalWindows[0].start)} –{' '}
                      {fmtTime((r as any).arrivalWindows[0].end)}
                    </div>
                  )}
              </div>

              {/* Items (Items arriba, número abajo) */}
              <div className="flex justify-between items-center mb-2">
                {/* Prioridad */}
                <p className="text-xs text-gray-600 mb-2 leading-tight">
                  <span className="font-medium">Prioridad:</span>{' '}
                  {badge(r.requisitionPriority)}
                </p>

                {/* Items + número juntos */}
                <div className="flex flex-col text-right leading-none">
                  <span className="text-[11px] text-[#01687d] font-medium">
                    Items
                  </span>
                  <span className="text-sm text-gray-800 font-semibold">
                    {r.items?.length ?? 0}
                  </span>
                </div>
              </div>

              {/* Comentarios */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <p className="text-xs text-gray-700 mb-0 leading-none font-medium">
                    Comentarios:
                  </p>
                  <p className="text-xs text-gray-600 mb-2 leading-snug">
                    {r.requisitionComments?.trim()
                      ? r.requisitionComments
                      : 'No hay comentarios'}
                  </p>
                </div>
                <p className="text-xs text-gray-600 mb-2 leading-tight">
                  <span className="font-medium">Estado:</span>{' '}
                  {statusBadge(r.requisitionStatus)}
                </p>
              </div>

              <hr className="my-2" />

              {/* Footer */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex gap-1 text-[#01687d]">
                  {/* VER */}
                  <div
                    className="p-1.5 rounded-full hover:bg-gray-200 transition cursor-pointer flex items-center justify-center"
                    onClick={e => {
                      e.stopPropagation();
                      onSelect(r.requisitionId);
                    }}
                  >
                    <Eye size={16} />
                  </div>
                  {r.requisitionStatus === 'APPROVED' ? null : (
                    <div
                      className="p-1.5 rounded-full hover:bg-gray-200 transition cursor-pointer flex items-center justify-center"
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(r.requisitionId);
                      }}
                    >
                      <Edit size={16} />
                    </div>
                  )}

                  {/* DUPLICAR */}
                  <div
                    className="p-1.5 rounded-full hover:bg-gray-200 transition cursor-pointer flex items-center justify-center"
                    onClick={e => {
                      e.stopPropagation();
                      console.log('Duplicar', r.requisitionId);
                    }}
                  >
                    <FileText size={16} />
                  </div>
                </div>
                {(() => {
                  const config = ACTIONS_BY_STATUS[r.requisitionStatus];

                  if (!config)
                    return (
                      <p className="text-xs text-gray-600">
                        Requisición firmada
                      </p>
                    );

                  return (
                    <button
                      className="bg-[#01687d] text-white px-3 py-1.5 cursor-pointer rounded-md text-xs hover:bg-[#5bb4cf]"
                      onClick={e => {
                        e.stopPropagation();
                        config.onClick(r.requisitionId);
                      }}
                    >
                      {config.label}
                    </button>
                  );
                })()}
                <ButtonBase label="Consultar Historico" onclick={openPopup} />
                <OrderHistory isPopupOpen={isPopupOpen} closePopup={closePopup} requisitionInfo={r}/>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-[45vh] w-[65vw]">
            <p className="text-center text-5xl font-bold text-gray-500 italic">
              No hay requisiciones en este estado
            </p>
          </div>
        )}
      </div>

      
    </>
  );
}
