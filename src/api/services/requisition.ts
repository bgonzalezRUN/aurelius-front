// requisitionService.ts
import type { BackendPayload, HistoryRequisition, LineItem, Requisition } from "../../types";
import api from "../http";




const REQUISITIONS_BASE = "/requisitions";

// Crear requisición
export const createRequisition = async (
  data: BackendPayload
): Promise<Requisition> => {
  const res = await api.post<Requisition>(`${REQUISITIONS_BASE}/`, data);
  return res.data;
};

// Obtener todas las requisiciones
export const getRequisitions = async (): Promise<Requisition[]> => {
  const res = await api.get<Record<string, Requisition[]>>(
    `${REQUISITIONS_BASE}/`
  );
  // Unificar todas las requisiciones en un solo array
  const flat = Object.values(res.data).flat();
  return flat;
};

// Obtener una requisición por ID
export const getRequisitionById = async (
  requisitionId: string
): Promise<Requisition> => {
  const res = await api.get<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}`
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
  data: LineItem[]
): Promise<Requisition> => {
  const res = await api.patch<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}`,
    data
  );
  return res.data;
};

export const updateSubmitRequisition = async (
  requisitionId: string
): Promise<Requisition> => {
  const res = await api.patch<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}/submit`
  );
  return res.data;
};

export const updateStateRequisition = async ({
  requisitionId,
  observation,
  type,
}: {
  requisitionId: string;
  observation?: string;
  type: 'validate' | 'reject';
}): Promise<Requisition> => {
  const res = await api.patch<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}/${type}`,
    { observation }
  );
  return res.data;
};

// Eliminar una requisición
export const deleteRequisition = async (
  requisitionId: string
): Promise<number> => {
  const res = await api.delete(`${REQUISITIONS_BASE}/${requisitionId}`);
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
