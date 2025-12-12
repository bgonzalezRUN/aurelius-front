import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRequisition,
  updateRequisition,
  updateSubmitRequisition,
  updateStateRequisition,
  deleteRequisition,
  signRequisition,
} from '../services/requisition';
import type { Requisition } from '../../types';
import { usePopupStore } from '../../store/popup';

export function useRequisitionMutations() {
  const queryClient = useQueryClient();
  const { openPopup: openPopupValidate } = usePopupStore();

  const createReq = useMutation({
    mutationFn: createRequisition,
    onSuccess: () => {
      openPopupValidate({
        title: 'Requisición creada',
        message: 'La requisición ha sido creada correctamente',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cerrar'
      });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });

  const updateReq = useMutation({
    mutationFn: ({
      requisitionId,
      data,
    }: {
      requisitionId: string;
      data: Partial<Requisition>;
    }) => updateRequisition(requisitionId, data),
    onSuccess: (_, variables) => {
      openPopupValidate({
        title: 'Requisición actualizada',
        message: 'La requisición ha sido actualizada correctamente',
        confirmButtonText: 'Aceptar',
      });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });

      queryClient.invalidateQueries({
        queryKey: ['requisitionById', variables.requisitionId],
      });
    },
  });

  const submitReq = useMutation({
    mutationFn: updateSubmitRequisition,
    onSuccess: (_, requisitionId) => {
      openPopupValidate({
        title: 'Solicitud de validación',
        message: 'La requisición ha sido enviada para ser validada.',
        confirmButtonText: 'Aceptar',
      });
      queryClient.invalidateQueries({
        queryKey: ['requisition-history', requisitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', requisitionId],
      });
    },
  });

  const changeReqState = useMutation({
    mutationFn: updateStateRequisition,
    onSuccess: (_, variables) => {
      openPopupValidate({
        title: 'Validar requisición',
        message:
          'La requisición ha sido validada correctamente. Podrás consultarlo en el historial.',
        confirmButtonText: 'Aceptar',
      });
      queryClient.invalidateQueries({
        queryKey: ['requisition-history', variables.requisitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', variables.requisitionId],
      });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });

  const deleteReq = useMutation({
    mutationFn: deleteRequisition,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['requisitions'] }),
  });

  const signReq = useMutation({
    mutationFn: ({
      requisitionId,
      user,
    }: {
      requisitionId: string;
      user: string;
    }) => signRequisition(requisitionId, user),
    onSuccess: (_, variables) => {
      openPopupValidate({
        title: 'Requisición aprobada',
        message:
          'La requisición ha sido aprobada correctamente. Podrás consultarlo en el historial.',
        confirmButtonText: 'Aceptar',
      });
      queryClient.invalidateQueries({
        queryKey: ['requisition-history', variables.requisitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', variables.requisitionId],
      });
    },
  });

  return {
    createReq,
    updateReq,
    submitReq,
    changeReqState,
    deleteReq,
    signReq,
  };
}
