import type { Category } from './category';
import type { Priority } from './priority';
import type { StatusDocument } from './statusDocument';

export const STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export const statusLabels: Record<Status, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  VALIDATED: 'Validada',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
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

export type TimeWindow = { start: string; end: string };

export type BackendPayload = {
  requisitionPriority: Priority;
  requisitionComments: string;
  arrivalDate: string;
  sendTo: SendTo[] | string[];
  items: LineItem[];
  arrivalWindows: TimeWindow[];
  categories: Partial<Category>[] | string[];
};

export type Requisition = {
  requisitionId: string;
  requisitionPriority: Priority;
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
  categories: Partial<Category>[];
};

export type LineItem = {
  material: string;
  metricUnit: string;
  quantity: string;
};

export const lineItemKeys: (keyof LineItem)[] = [
  'material',
  'metricUnit',
  'quantity',
];

export const lineItemLabels: Record<keyof LineItem, string> = {
  material: 'Material',
  metricUnit: 'Unidad',
  quantity: 'Cantidad',
};

export type RequisitionFilter = {
  categories: string;
  offset: number;
  limit: number;
  costCenterId: number
  search: string
  status: string
};
