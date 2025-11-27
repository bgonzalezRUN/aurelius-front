import { create } from 'zustand';

const initialState = {
  open: false,
  title: '',
  onConfirm: () => {},
  message: '',
  cancelButtonText: 'Cancelar',
  confirmButtonText: 'Continuar',
};

interface OpenPopup {
  title: string;
  message: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onConfirm?: () => void | null;
}

interface PopupStore {
  open: boolean;
  openPopup: (payload: OpenPopup) => void;
  closePopup: () => void;
  title: string;
  message: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  reset: () => void;
  onConfirm?: (() => void) | null;
}

export const usePopupStore = create<PopupStore>((set, get) => ({
  ...initialState,
  openPopup: ({
    title,
    message,
    cancelButtonText,
    confirmButtonText,
    onConfirm,
  }) =>
    set(state => ({
      ...state,
      open: true,
      title,
      message,
      ...(cancelButtonText && { cancelButtonText }),
      ...(confirmButtonText && { confirmButtonText }),
      onConfirm,
    })),

  closePopup: () => {
    get().reset(); // 👈 Al cerrar resetea todo automáticamente
  },

  reset: () => set(initialState),
}));
