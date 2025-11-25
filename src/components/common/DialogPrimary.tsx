import type { FC, ReactNode } from 'react';
import { CircleX } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

const DialogPrimary: FC<PopupProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[10px] shadow-2xl max-w-96 w-full border border-solid border-grayPrimary transform transition-all duration-300 scale-100 opacity-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center h-12 bg-primary-primary rounded-t-[10px] border border-solid border-grayPrimary text-white px-3">
          <h2 className="text-xl font-extrabold ">{title}</h2>
          <button
            onClick={onClose}        
            aria-label="Cerrar"
          >
            <CircleX size={24} />
          </button>
        </div>
        <div className="p-4">
        {children}

        </div>

      </div>
    </div>
  );
};

export default DialogPrimary;
