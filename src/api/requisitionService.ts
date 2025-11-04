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
  priority: string;
  project: string;
  comments: string;
  sendTo: BackendSendTo[];
  items: BackendItem[];
  arrivalDate: string; // ISO con Z
};

export type Requisition = {
  id: string;
  priority: string;
  project: string;
  comments: string;
  sendTo: BackendSendTo[];
  items: BackendItem[];
  arrivalDate?: string;
  requesterSignature?: string | null;
  directorSignature?: string | null;
  superintendentSignature?: string | null;
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
export const getRequisitionById = async (id: string): Promise<Requisition> => {
  const res = await api.get<Requisition>(`${REQUISITIONS_BASE}/${id}`);
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

// Eliminar una requisición
export const deleteRequisition = async (id: string): Promise<any> => {
  const res = await api.delete(`${REQUISITIONS_BASE}/${id}`);
  return res.data;
};

// Firmar requisición
export const signRequisition = async (
  id: string,
  signatureText: string,
  role: string
): Promise<any> => {
  // El interceptor ya pone el token, aquí SOLO enviamos role y signature
  const res = await api.patch(`/requisitions/${id}`, {
    role,
    signature: signatureText,
  });
  return res.data;
};
