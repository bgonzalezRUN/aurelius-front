import {
  COST_CENTER_STATUS_ITEM,
  type COST_CENTER_STATUS,
} from '../../types/costCenter';

const statusStyles: Record<COST_CENTER_STATUS, string> = {
  DRAFT: 'bg-blue-100 text-blue-700',
  FROZEN: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-700',
  OPEN: 'bg-green-100 text-green-700',
};

export const StatusBadge = ({ status }: { status: COST_CENTER_STATUS }) => {
  const base =
    'px-2 py-0.5 rounded-[5px] text-xs font-medium text-center max-w-fit';

  const styles = statusStyles[status] ?? 'bg-gray-100 text-gray-700';
  const label = COST_CENTER_STATUS_ITEM[status];

  return <span className={`${base} ${styles}`}>{label}</span>;
};
