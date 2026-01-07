import { useParams } from 'react-router-dom';
import { H1 } from '../components/common/Text';
import { data } from '../types/proveedores';

export default function SupplierDetails() {
  const { supplierId } = useParams();
  const currentSupplier = data.find(supplier => supplier.id === supplierId);

  return (
    <div className="flex flex-col h-full max-h-screen gap-y-5">
      <div className="flex justify-between items-center">
        <div>
          <H1>{currentSupplier?.bankName}</H1>
        </div>
      </div>

      <div className="bg-white rounded-lg w-full p-5 flex flex-col gap-y-2 text-grey-primary font-semibold">
        <p>
          <span className="text-secondary font-bold">Dirección: </span>
          {currentSupplier?.fiscalAddress}
        </p>
       
      </div>
    </div>
  );
}
