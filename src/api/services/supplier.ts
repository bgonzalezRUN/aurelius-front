import type { PaginationData } from '../../types/pagination';
import type { SupplierDTO } from '../../types/supplier';
import { createFormData } from '../../utils/createFormData';
import api from '../http';

const SUPPLIER = 'supplier';

interface ApiCCResponse extends PaginationData {
  data: Partial<SupplierDTO[]>;
}

export const createSupplier = async (data: SupplierDTO): Promise<void> => {
  const formData = createFormData(data);
  const res = await api.post(`${SUPPLIER}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getSuppliers = async (
  params?: Record<string, unknown>
): Promise<ApiCCResponse> => {
  const res = await api.get<ApiCCResponse>(`${SUPPLIER}`, {
    params,
  });
  return res.data;
};

export const getSuppliernById = async (
  supplierId: string
): Promise<SupplierDTO> => {
  const res = await api.get<SupplierDTO>(`${SUPPLIER}/${supplierId}`);
  return res.data;
};

export const deleteSupplier = async (supplierId: string): Promise<void> => {
  const res = await api.delete(`${SUPPLIER}/${supplierId}`);
  return res.data;
};

export type StatusChange = 'active' | 'block' | 'suspend';
export const changeStatusSupplier = async (
  supplierId: string,
  status: StatusChange
): Promise<void> => {
  const res = await api.patch(`${SUPPLIER}/${supplierId}/${status}`);
  return res.data;
};