import type { ReactNode } from 'react';
import { statusLabels, type Status } from '../../types';
import { ThumbsUp, ThumbsDown, Clock5 } from 'lucide-react';

const statusStyles: Partial<Record<Status, string>> = {
  APPROVED: 'text-green-primary',
  REJECTED: 'text-red-primary',
};

const statusIcons: Partial<Record<Status, ReactNode>> = {
  APPROVED: <ThumbsUp />,
  REJECTED: <ThumbsDown />,
};

export default function HistoryStatus({ status }: { status: Status }) {
  const base = 'text-base font-normal inline-flex items-center gap-1';
  const styles = statusStyles[status] ?? 'text-orange-primary';
  const label = statusLabels[status] ?? status;
  const icon = statusIcons[status] ?? <Clock5 />;

  return (
    <span className={`${base} ${styles}`}>
      {icon}
      {label}
    </span>
  );
}
