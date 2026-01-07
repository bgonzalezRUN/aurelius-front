import { useMutation } from '@tanstack/react-query';
import { createSupplier as create } from '../services/supplier';
import type { ApiError } from '../http';
import type { SupplierDTO } from '../../types/supplier';
import { usePopupStore } from '../../store/popup';

export function useSupplierMutations() {
  //   const queryClient = useQueryClient();
  const { openPopup: openPopupValidate } = usePopupStore();

  const createSupplier = useMutation<void, ApiError, SupplierDTO>({
    mutationFn: create,
    onSuccess: () => {
      openPopupValidate({
        title: 'Proveedor creado',
        message:
          'EL proveedor se ha creado correctamente, podrás iniciar sesión con el email de comercial que proporcionaste',
        confirmButtonText: 'Entendido',
      });
    },
  });

  return {
    createSupplier,
  };
}
