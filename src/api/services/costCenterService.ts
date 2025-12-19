import type {
  COST_CENTER,
  USER_BY_CC,
  USER_IN_CC,
} from '../../types/costCenter';
import type { PaginationData } from '../../types/pagination';
import api from '../http';

const COST_CENTE_BASE = '/cost-center';
const USER = '/user-cost-center';

interface ApiCCResponse extends PaginationData {
  data: Partial<COST_CENTER[]>;
}

const createFormData = (data: COST_CENTER): FormData => {
  const formData = new FormData();

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key as keyof COST_CENTER];

      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    }
  }

  return formData;
};

export const createCostCenter = async (data: COST_CENTER): Promise<void> => {
  const formData = createFormData(data);
  const res = await api.post(`${COST_CENTE_BASE}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

export const getCostCenter = async (
  params?: Record<string, unknown>
): Promise<ApiCCResponse> => {
  const res = await api.get<ApiCCResponse>(`${COST_CENTE_BASE}`, {
    params,
  });
  return res.data;
};

export const getCostCenterById = async (
  costCenterId: string
): Promise<COST_CENTER> => {
  const res = await api.get<COST_CENTER>(`${COST_CENTE_BASE}/${costCenterId}`);
  return res.data;
};

export const getUsersByCostCenter = async (
  costCenterId: string
): Promise<USER_IN_CC[]> => {
  const res = await api.get(`${USER}${COST_CENTE_BASE}/${costCenterId}`);
  return res.data;
};

export const assigneAUserToACC = async (data: USER_BY_CC): Promise<void> => {
  const res = await api.post(`${USER}/assign`, data);

  return res.data;
};

export const deleteCC = async (
  costCenterId: string
): Promise<void> => {
  const res = await api.delete(`${COST_CENTE_BASE}/${costCenterId}`);
  return res.data;
};

export type StatusChange = 'close' | 'frozen' | 'open';
export const changeStatusCC = async (
  costCenterId: string,
  status: StatusChange
): Promise<void> => {
  const res = await api.patch(`${COST_CENTE_BASE}/${costCenterId}/${status}`);
  return res.data;
};