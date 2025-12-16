import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assigneAUserToACC, createCostCenter as create } from '../services/costCenterService';
import { usePopupStore } from '../../store/popup';
import type { USER_BY_CC } from '../../types/costCenter';
import type { ApiError } from '../http';

export function useCostCenterMutations() {
  const queryClient = useQueryClient();
  const { openPopup: openPopupValidate } = usePopupStore();

  const createCostCenter = useMutation({
    mutationFn: create,
    onSuccess: () => {
      openPopupValidate({
        title: 'Centro de costos creado',
        message: 'El centro de costos se ha creado correctamente.',
        confirmButtonText: 'Aceptar',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center'],
      });
    },
  });

  const inviteAUserToACC = useMutation<void, ApiError, USER_BY_CC>({
    mutationFn: assigneAUserToACC,
    onSuccess: () => {
      openPopupValidate({
        title: 'Asignación creada',
        message: 'Se ha invitado al usuario correctamente',
        confirmButtonText: 'Aceptar',
      });
      queryClient.invalidateQueries({
        queryKey: ['cost-center-users'],
      });
    },
  });

  return {
    createCostCenter,
    inviteAUserToACC
  };
}
