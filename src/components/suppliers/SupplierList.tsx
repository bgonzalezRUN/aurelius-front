import { useMemo } from 'react';
import type { Supplier} from '../../types/supplier';
import ListWrap from '../common/ListWrap';
import { Eye } from 'lucide-react';
import { OptionButton } from '../common';
import { paths } from '../../paths';
import { NavLink } from 'react-router-dom';

const tableHeaders = ['Nombre', 'Dirección', 'Estado', 'Ver más'];

export default function SupplierList({ data }: { data: Supplier[] }) {
  const content = useMemo(() => {
    if (!data) return [];
    return data.map(value => [
      <p className="text-secondary font-bold">{value.bankName}</p>,
      <p className="text-grey-primary font-bold">{value.fiscalAddress}</p>,
      // <p className="text-grey-primary font-bold">{value}</p>,
      <NavLink to={`${paths.SUPPLIER}/${value.id}`}>
        <OptionButton title="Ver detalles">
          <Eye className="text-grey-primary" />
        </OptionButton>
      </NavLink>,
    ]);
  }, [data]);

  return <ListWrap tableHeaders={tableHeaders} content={content} />;
}
