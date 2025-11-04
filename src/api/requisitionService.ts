import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE = "http://localhost:3000/requisitions";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InJlcXVlc3RlciIsImlhdCI6MTc2MTkyOTExOSwiZXhwIjoxNzYxOTMyNzE5fQ.A33IyJg9K6E4Uvfrhuq4Te6Otfj6C1Vji4_1SIcqHK0";

localStorage.setItem("token", TOKEN);

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

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Crear requisición
export const createRequisition = async (data: BackendPayload): Promise<Requisition> => {
  const res = await api.post("/", data);
  return res.data;
};

// Obtener todas las requisiciones
export const getRequisitions = async (): Promise<Requisition[]> => {
  const res = await api.get("/");
  return res.data;
};

// Obtener una requisición por ID
export const getRequisitionById = async (id: string): Promise<Requisition> => {
  const res = await api.get(`/${id}`);
  return res.data;
};

// Buscar por nombre de proyecto
export const searchRequisitionsByProject = async (projectName: string): Promise<Requisition[]> => {
  const res = await api.get(`/projectname/${encodeURIComponent(projectName)}`);
  return res.data;
};

// Eliminar una requisición
export const deleteRequisition = async (id: string): Promise<any> => {
  const res = await api.delete(`/${id}`);
  return res.data;
};

// Firmar requisición
export const signRequisition = async (id: string, signatureText: string): Promise<any> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token no encontrado");

  const decoded: any = jwtDecode(token);
  const role = decoded?.role;
  if (!role) throw new Error("No se encontró 'role' en el token");

  const res = await axios.patch(
    `${API_BASE}/${id}`,
    { role, signature: signatureText },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};
