import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRequisition,
  updateRequisition,
  updateSubmitRequisition,
  updateStateRequisition,
  deleteRequisition,
  signRequisition,
} from '../services/requisition';
import type { LineItem } from '../../types';

export function useRequisitionMutations() {
  const queryClient = useQueryClient();

  const createReq = useMutation({
    mutationFn: createRequisition,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['requisitions'] }),
  });

  const updateReq = useMutation({
    mutationFn: ({
      requisitionId,
      data,
    }: {
      requisitionId: string;
      data: LineItem[];
    }) => updateRequisition(requisitionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', variables.requisitionId],
      });
    },
  });

  const submitReq = useMutation({
    mutationFn: updateSubmitRequisition,
   onSuccess: (_, requisitionId) => {
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
      queryClient.invalidateQueries({
        queryKey: ['requisition-history', variables.requisitionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['requisitionById', variables.requisitionId],
      });
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
