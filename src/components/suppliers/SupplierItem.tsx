import { useSupplierById } from '../../api/queries/supplierQueries';

import { Eye } from 'lucide-react';
import { OptionButton } from '../common';
import { paths } from '../../paths';
import { NavLink } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { statusLabelsSupplier } from '../../types/supplier';


export default function SupplierItem({ supplierId }: { supplierId: string }) {
  const { data } = useSupplierById(supplierId);
  if (!data) return null;

  const requisitionDetails = {
    name: <p className="text-secondary font-bold">{data.companyName}</p>,
    address: (
      <p className="text-grey-primary font-bold">{data.fiscalAddress}</p>
    ),
    status: <p className="text-grey-primary font-bold">{statusLabelsSupplier[data.supplierStatus]}</p>,
    more: (
      <NavLink to={`${paths.ADMIN}/${paths.SUPPLIER}/${supplierId}`}>
        <OptionButton title="Ver detalles">
          <Eye className="text-grey-primary" />
        </OptionButton>
      </NavLink>
    ),
  };
  return (
    <>
      {Object.entries(requisitionDetails).map(([key, valor]) => (
        <Fragment key={key}>{valor}</Fragment>
      ))}
    </>
  );
}
