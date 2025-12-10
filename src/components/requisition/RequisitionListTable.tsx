import type { Requisition } from '../../types';
import RequisitionItemList from './RequisitionItemList';

export default function RequisitionListTable({
  data,
}: {
  data: Partial<Requisition[]>;
}) {
  const tableHeaders = [
    'Nro. de Requisición',
    'Nombre',
    'Fecha',
    'Horario',
    'Categorías',
    'Prioridad',
    'Items',
    'Comentarios',
    'Estado',
  ];

  return (
    <div className='flex flex-col h-full'>
      <div className="flex [&>*]:flex-1 items-start gap-x-3 mb-3 px-4 flex-none">
        {tableHeaders.map(header => (
          <span
            className="text-grey-600 font-bold text-xl text-center"
            key={header}
          >
            {header}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto flex-1">
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
