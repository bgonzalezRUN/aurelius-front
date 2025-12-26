import type {
  BackendPayload,
  HistoryRequisition,
  Requisition,
  RequisitionFilter,
} from '../../types';
import type { Category } from '../../types/category';
import type { PaginationData } from '../../types/pagination';
import api from '../http';

const REQUISITIONS_BASE = '/requisitions';

interface ApiRequisitionResponse extends PaginationData {
  data: Partial<Requisition>[];
}

// Crear requisición
export const createRequisition = async (
  data: BackendPayload,
  costCenterId: string
): Promise<Requisition> => {
  const res = await api.post<Requisition>(`${REQUISITIONS_BASE}/`, data, {
    headers: { 'x-cost-center-id': costCenterId },
  });
  return res.data;
};

// Obtener todas las requisiciones
export const getRequisitions = async (
  params?: RequisitionFilter
): Promise<ApiRequisitionResponse> => {
  const res = await api.get<ApiRequisitionResponse>(`${REQUISITIONS_BASE}`, {
    params,
    headers: { 'x-cost-center-id': params?.costCenterId },
  });

  return res.data;
};
// Obtener una requisición por ID
export const getRequisitionById = async (
  requisitionId: string,
  costCenterId: string
): Promise<Requisition> => {
  const res = await api.get<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}`,
    {
      headers: { 'x-cost-center-id': costCenterId },
    }
  );
  return res.data;
};

// Buscar por nombre de proyecto
export const searchRequisitionsByProject = async (
  projectName: string
): Promise<Requisition[]> => {
  const res = await api.get<Requisition[]>(
    `${REQUISITIONS_BASE}/projectname/${encodeURIComponent(projectName)}`
  );
  return res.data;
};

export const updateRequisition = async (
  requisitionId: string,
  data: Partial<Requisition>,
  costCenterId: string
): Promise<Requisition> => {
  const res = await api.patch<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}`,
    data,
    {
      headers: { 'x-cost-center-id': costCenterId },
    }
  );
  return res.data;
};

export const updateSubmitRequisition = async (
  requisitionId: string,
  costCenterId: string
): Promise<Requisition> => {
  const res = await api.patch<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}/submit`,
    {},
    {
      headers: { 'x-cost-center-id': costCenterId },
    }
  );
  return res.data;
};

export const updateStateRequisition = async ({
  requisitionId,
  observation,
  type,
  costCenterId,
}: {
  requisitionId: string;
  observation?: string;
  type: 'validate' | 'reject';
  costCenterId: string;
}): Promise<Requisition> => {
  const res = await api.patch<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}/${type}`,
    { observation },
    {
      headers: { 'x-cost-center-id': costCenterId },
    }
  );
  return res.data;
};

// Eliminar una requisición
export const deleteRequisition = async (
  requisitionId: string,
  costCenterId: string
): Promise<void> => {
  const res = await api.delete(`${REQUISITIONS_BASE}/${requisitionId}`, {
    headers: { 'x-cost-center-id': costCenterId },
  });
  return res.data;
};

// Firmar requisición
export const signRequisition = async (
  requisitionId: string,
  user: string
): Promise<Requisition> => {
  const ip = await fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => data.ip)
    .catch(() => 'unknown');

  const res = await api.patch(`/requisitions/${requisitionId}/sign`, {
    requisitionId,
    user,
    ip,
    action: 'sign',
  });

  return res.data;
};

export const historyRequisition = async (
  requisitionId: string
): Promise<HistoryRequisition[]> => {
  const res = await api.get(`requisition-history/${requisitionId}`);
  return res.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get(`/requisition-category/`);

  return res.data;
};
