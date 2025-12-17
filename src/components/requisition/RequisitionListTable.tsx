import type { Requisition } from '../../types';
import { Header, Row } from '../common/ListWrap';
import RequisitionItemList from './RequisitionListView';

export default function RequisitionListTable({
  data,
}: {
  data: Partial<Requisition[]>;
}) {
  const tableHeaders = [
    'Nro. de Requisición',
    'Fecha',
    'Horario',
    'Categorías',
    'Prioridad',
    'Items',
    'Comentarios',
    'Estado',
  ];

  return (
    <div className="w-full space-y-2">
      <Header tableHeaders={tableHeaders} />

      {data.map(r => (
        <Row numberColumns={tableHeaders.length}>
          <RequisitionItemList requisitionId={r?.requisitionId || ''} />
        </Row>
      ))}
    </div>
  );
}
