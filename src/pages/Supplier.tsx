import { Boxes } from 'lucide-react';
import { H1 } from '../components/common/Text';
import { Search } from '../components/common/Search';
import { useCallback, useState } from 'react';
import SupplierList from '../components/suppliers/SupplierList';
import type { Supplier } from '../types/supplier';
import { data } from '../types/proveedores';


export default function Supplier() {
  const [query, setQuery] = useState<string>('');
  const handleChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  return (
    <>
      <div className="flex flex-col h-full max-h-screen gap-y-5">
        <div className="flex justify-between flex-none mb-2 items-center gap-x-4">
          <H1>
            <Boxes size={28} />
            Proveedores
          </H1>
        </div>
        <Search
          value={query}
          onChange={handleChange}
          disabled={!data.length && !query}
        />
        <div className="overflow-y-auto flex-1">
          <SupplierList data={data} />
        </div>

        <div className="mt-auto px-2 flex-none">
          {/* <Pagination
            pagination={{
              currentPage: data?.currentPage || 0,
              totalPages: data?.totalPages || 0,
              totalItems: data?.totalItems || 0,
              itemsPerPage: data?.itemsPerPage || 0,
            }}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          /> */}
          paginación
        </div>
      </div>
    </>
  );
}
