import { statusLabelsDocument, type StatusDocument } from "../../types";


const statusStyles: Record<StatusDocument, string> = {
  DRAFT: "bg-blue-100 text-blue-700",
  PENDING: "bg-yellow-100 text-yellow-800",
  VALIDATED: "bg-green-100 text-green-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export const StatusBadge = ({ status }: { status: StatusDocument }) => {
  const base = "px-2 py-0.5 rounded-lg text-xs font-medium";
  const styles = statusStyles[status] ?? "bg-gray-100 text-gray-700";
  const label = statusLabelsDocument[status] ?? status;

  return <span className={`${base} ${styles}`}>{label}</span>;
};