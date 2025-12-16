import { useCallback } from 'react';
import { BaseButton, Dialog } from '../common';
import { useForm } from 'react-hook-form';
import { FileInput, Input, Textarea, type FileSelection } from '../form';
import type { COST_CENTER, KeyofCostCenter } from '../../types/costCenter';
import { useCostCenterMutations } from '../../api/queries/costCenterMutation';

const MAX_FILE_SIZE = 10485760;

export default function CreationForm({
  onClose,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
}) {
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isValid },
  } = useForm<COST_CENTER>({ mode: 'onChange' });

  const { createCostCenter } = useCostCenterMutations();
  const onSubmit = (data: COST_CENTER) => {
    createCostCenter.mutate(data);
    // onClose()
  };

  const handleFilesSelected = useCallback(
    (data: FileSelection) => {
      if (data?.inputName && data?.files?.[0]) {
        setValue(data.inputName as KeyofCostCenter, data?.files[0]);
      }
    },
    [setValue]
  );

  const validateFileSize = (value: File) => {
    if (!value) {
      return true;
    }
    const file = value;

    if (file.size > MAX_FILE_SIZE) {
      return `El archivo no debe pesar más de ${
        MAX_FILE_SIZE / 1024 / 1024
      } MB.`;
    }
    return true;
  };

  return (
    <Dialog isOpen={isOpen} title="Nuevo Centro de Costo" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="hidden"
          {...register('costCenterCalender', {
            validate: value => validateFileSize(value as File),
          })}
        />
        <input
          type="hidden"
          {...register('costCenterBudget', {
            validate: value => validateFileSize(value as File),
          })}
        />
        <input
          type="hidden"
          {...register('costCenterRules', {
            validate: value => validateFileSize(value as File),
          })}
        />
        <div className="flex gap-x-2 [&>div]:w-2/4">
          <Input
            label="Nombre"
            registration={register('costCenterName', {
              required: 'Escribe el nombre del centro de costos.',
            })}
            errorMessage={errors.costCenterName?.message}
            name="costCenterName"
          />
          <Input
            label="Dirección"
            registration={register('costCenterAddress', {
              required: 'Escribe la dirección del centro de costos.',
            })}
            errorMessage={errors.costCenterAddress?.message}
            name="costCenterAddress"
          />
        </div>
        <Textarea
          label="Descripción"
          name="costCenterDescription"
          registration={register('costCenterDescription')}
          errorMessage={errors.costCenterDescription?.message}
        />
        <FileInput
          label="Calendario"
          name="costCenterCalender"
          accept="application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.xls,.xlsx,.csv"
          onFilesSelected={handleFilesSelected}
          errorMessage={errors.costCenterCalender?.message}
        />
        <FileInput
          label="Presupuesto"
          name="costCenterBudget"
          accept="application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.xls,.xlsx,.csv"
          onFilesSelected={handleFilesSelected}
          errorMessage={errors.costCenterBudget?.message}
        />
        <FileInput
          label="Reglas"
          name="costCenterRules"
          accept="application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.xls,.xlsx,.csv"
          onFilesSelected={handleFilesSelected}
          errorMessage={errors.costCenterRules?.message}
        />
        <div className="flex justify-end mt-4">
          <BaseButton
            label="Crear centro de costos"
            size="md"
            type="submit"
            disabled={!isValid}
          />
        </div>
      </form>
    </Dialog>
  );
}
