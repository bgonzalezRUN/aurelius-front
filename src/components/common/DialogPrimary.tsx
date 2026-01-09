import type { FC, ReactNode } from 'react';
import { CircleX } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

const DialogPrimary: FC<PopupProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 "
      onClick={onClose}
    >
      <div
        className="rounded-[10px] border border-solid border-grayPrimary shadow-2xl max-w-96 w-full bg-white transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center min-h-12 bg-primary-primary rounded-t-[10px] text-white px-3 py-2">
          <h2 className="text-xl font-extrabold ">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar">
            <CircleX size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-y-3 p-4 ">{children}</div>
      </div>
    </div>
  );
};

export default DialogPrimary;
