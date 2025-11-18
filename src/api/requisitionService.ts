// requisitionService.ts
import api from "./http";

export type BackendSendTo = { name: string };
export type BackendItem = {
  material: string;
  metricUnit: string;
  quantity: string;
  part: string;
  subpart: string;
};

export type BackendPayload = {
  requisitionPriority: string;
  project: string;
  requisitionComments: string;
  sendTo: BackendSendTo[];
  items: BackendItem[];
  arrivalDate: string;
};

export type Requisition = {
  requisitionId: string;
  requisitionPriority: string;
  project: string;
  requisitionComments: string;
  sendTo: BackendSendTo[];
  items: BackendItem[];
  arrivalDate?: string;
  requisitionSignature?: string;
};

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
  const res = await api.get<Requisition[]>(`${REQUISITIONS_BASE}/`);
  return res.data;
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
  data: BackendItem[]
): Promise<Requisition> => {
  const res = await api.patch<Requisition>(
    `${REQUISITIONS_BASE}/${requisitionId}`,
    data
  );
  return res.data;
};

// Eliminar una requisición
export const deleteRequisition = async (
  requisitionId: string
): Promise<any> => {
  const res = await api.delete(`${REQUISITIONS_BASE}/${requisitionId}`);
  return res.data;
};

// Firmar requisición
export const signRequisition = async (
  requisitionId: string,
  user: string
): Promise<any> => {
  const ip = await fetch("https://api.ipify.org?format=json")
    .then((res) => res.json())
    .then((data) => data.ip)
    .catch(() => "unknown");

  const res = await api.patch(`/requisitions/${requisitionId}/sign`, {
    requisitionId,
    user,
    ip,
    action: "sign",
  });

  return res.data;
};
