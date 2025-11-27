import type { Priority } from "../../types/priority";
import { capitalizeWords } from "../../utils";

const priorityStyles: Record<Priority, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-yellow-100 text-yellow-800",
  baja: "bg-green-100 text-green-700",
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const base = "px-2 py-0.5 rounded-[5px] text-xs font-medium";
  const styles = priorityStyles[priority] ?? "bg-gray-100 text-gray-700";

  return <span className={`${base} ${styles} `}>{`Prioridad ${capitalizeWords(priority)}`}</span>;
};