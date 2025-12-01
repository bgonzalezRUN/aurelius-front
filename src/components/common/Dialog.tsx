import type { FC, ReactNode } from 'react';
import { CircleX } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

const Dialog: FC<PopupProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
      <div
        className="bg-white p-6 rounded-[10px] shadow-2xl max-w-3xl w-full border border-solid border-grayPrimary transform transition-all duration-300 scale-100  opacity-100  max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
       
        <div className="flex justify-between items-center mb-4 flex-none">
          <h2 className="text-2xl font-extrabold text-grey-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <CircleX size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
