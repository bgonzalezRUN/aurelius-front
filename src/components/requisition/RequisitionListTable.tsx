import type { Requisition } from '../../types';
import RequisitionItemList from './RequisitionItemList';

export default function RequisitionListTable({
  data,
}: {
  data: Partial<Requisition[]>;
}) {
  const tableHeaders = [
    'Nombre',
    'Fecha',
    'Proveedor sugerido',
    'Horario',
    'Categorías',
    'Prioridad',
    'Items',
    'Comentarios',
    'Estado',
  ];

  return (
    <div>
      <div className="flex [&>*]:flex-1 items-start gap-x-3 mb-3 px-3">
        {tableHeaders.map(header => (
          <span
            className="text-grey-600 font-bold text-xl text-center"
            key={header}
          >
            {header}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        {data.map((r, index) => (
          <RequisitionItemList
            requisitionId={r?.requisitionId || ''}
            key={r?.requisitionId || index}
          />
        ))}
      </div>
    </div>
  );
}
