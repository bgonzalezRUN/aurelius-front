import type { Category } from "./category";
import type { Priority } from "./priority";
import type { StatusDocument } from "./statusDocument";

export const STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;


export type Status = (typeof STATUS)[keyof typeof STATUS];

export const statusLabels: Record<Status, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  VALIDATED: "Validada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export type HistoryRequisition = {
  historyId: string;
  historyObservation: string | null;
  historyAction: Status;
  historyUser: string;
  createdAt: string;
};

export type SendTo = { name: string };
export type IRequisitionRequester = { name: string; timestamp: string };
export type IRequisitionValidator = { name: string; timestamp: string };
export type IRequisitionStatus = { status: string };


export type BackendPayload = {
  requisitionPriority: string;
  project: string;
  requisitionComments: string;
  sendTo: SendTo[];
  items: LineItem[];
  arrivalDate: string;
};

export type Requisition = {
  requisitionId: string;
  requisitionPriority: Priority;
  project: string;
  requisitionComments: string;
  requisitionStatus: StatusDocument;
  sendTo: SendTo[];
  items: LineItem[];
  arrivalDate?: string;
  requester: IRequisitionRequester;
  validator: IRequisitionValidator;
  approver?: string;
  requisitionCode: string;
  arrivalWindows: { start: string; end: string }[];
  categories: Partial<Category>[]
};

export type LineItem = {    
  material: string;
  metricUnit: string;
  quantity: string;
  part: string;
  subpart: string;
};

export const lineItemKeys: (keyof LineItem)[] = [
  "material",
  "metricUnit",
  "quantity",
  "part",
  "subpart"
];

export const lineItemLabels: Record<keyof LineItem, string> = {
  material: "Material",
  metricUnit: "Unidad",
  quantity: "Cantidad",
  part: "Partida",
  subpart: "Subpartida",
};