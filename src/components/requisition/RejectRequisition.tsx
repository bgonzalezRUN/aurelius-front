import { useForm } from 'react-hook-form';
import DialogPrimary from '../common/DialogPrimary';
import { BaseButton } from '../common';
import { useRequisitionMutations } from '../../api/queries/requisitionMutations';

type FormData = {
  observation: string;
};

export default function RejectRequisition({
  isPopupOpen,
  closePopup,
  requisitionId,
}: {
  isPopupOpen: boolean;
  closePopup: () => void;
  requisitionId: string;
}) {
  const { changeReqState } = useRequisitionMutations();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    changeReqState.mutate({
      observation: data.observation,
      type: 'reject',
      requisitionId,
    });

    closePopup();
  };

  return (
    <DialogPrimary
      isOpen={isPopupOpen}
      onClose={closePopup}
      title="Desaprobar Requisición"
    >
      <p className="text-grey-100 text-base font-semibold">
        ¿Seguro que quieres desaprobar la requisición?
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
        <textarea
          {...register('observation', {
            required: 'Por favor ingresa un motivo.',
            minLength: {
              value: 5,
              message: 'El motivo debe tener al menos 5 caracteres.',
            },
          })}
          className="w-full rounded-[10px] border border-solid border-grayPrimary resize-none p-2 text-grey-100"
          rows={4}
          placeholder="Por favor, indica el motivo por el cual desapruebas esta requisición."
        />

        {errors.observation && (
          <p className="text-red-500 text-xs mt-1">
            {errors.observation.message}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <BaseButton
            label="Cancelar"
            onclick={closePopup}
            size="md"
            variant="secondary"
          />
          <BaseButton
            label="Desaprobar"
            type="submit"
            size="md"
            disabled={!isValid}
          />
        </div>
      </form>
    </DialogPrimary>
  );
}
