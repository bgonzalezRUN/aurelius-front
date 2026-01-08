import type { SupplierDTO } from '../../types/supplier';
import { Header, Row } from '../common/ListWrap';
import WithoutData from '../common/WithoutData';
import SupplierItem from './SupplierItem';

const tableHeaders = ['Nombre', 'Dirección', 'Estado', 'Ver más'];

export default function SupplierList({
  data,
}: {
  data: Partial<SupplierDTO[]>;
}) {
  if (!data || data.length === 0) {
    return <WithoutData message="No hay proveedores" />;
  }
  return (
    <div className="w-full space-y-2">
      <Header tableHeaders={tableHeaders} />

      {data.map(supplier => (
        <Row numberColumns={tableHeaders.length}>
          <SupplierItem
            supplierId={supplier?.supplierId || ''}
            key={supplier?.supplierId}
          />
        </Row>
      ))}
    </div>
  );
}
