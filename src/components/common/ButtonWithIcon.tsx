import type { ReactNode } from 'react';

export default function ButtonWithIcon({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white flex items-center rounded-lg shadow border border-primaryDark group ml-auto h-11"
    >
      <div className="bg-primaryDark text-white px-3 py-2 flex items-center justify-center group-hover:bg-primaryDark transition rounded-l-lg ">
        <span className="text-lg font-bold">{icon}</span>
      </div>
      <span className="px-5 py-2 text-primaryDark font-medium group-hover:bg-gray-50 transition rounded-lg ">
        {label}
      </span>
    </button>
  );
}
