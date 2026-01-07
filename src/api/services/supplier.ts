import type { SupplierDTO } from '../../types/supplier';
import { createFormData } from '../../utils/createFormData';
import api from '../http';

const SUPPLIER = 'supplier';

export const createSupplier = async (data: SupplierDTO): Promise<void> => {
  const formData = createFormData(data);
  const res = await api.post(`${SUPPLIER}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
