import { create } from 'zustand';

const initialState = {
  open: false,
  title: '',
  onConfirm: null,
  message: '',
  cancelButtonText: 'Cancelar',
  confirmButtonText: 'Continuar',
};

interface PopupStore {
  open: boolean;
  openPopup: () => void;
  closePopup: () => void;
  setOnConfirm: (onConfirm: void) => void;
  onConfirm: void | null;
  title: string;
  message: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

export const usePopupStore = create<PopupStore>(set => ({
  ...initialState,
  openPopup: () =>
    set(state => ({
      ...state,
      open: true,
    })),

  closePopup: () =>
    set(state => ({
      ...state,
      open: false,
    })),

  setOnConfirm: onConfirm =>
    set(state => ({
      ...state,
      onConfirm: onConfirm,
    })),
  reset: () => set(initialState),
}));
