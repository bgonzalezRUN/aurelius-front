import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
// import {
//   createRequisition,
//   updateRequisition,
// } from '../api/requisitionService';

import {
  lineItemKeys,
  lineItemLabels,
  PRIORITY,
  type BackendPayload,
  type LineItem,
  type Requisition,
  type SendTo,
} from '../types';
import { BaseButton, Dialog, OptionButton } from './common';
import { MultiSelect, FileInput, Input, Select, Textarea } from './form';
import { useForm, useFieldArray } from 'react-hook-form';
import { capitalizeWords } from '../utils';
import useExtractItemsFromFile from '../hooks/useExtractItemsFromFile';
import { labelClasses } from './form/styles';
import ErrorMessage from './common/ErrorMessage';
import { useRequisitionMutations } from '../api/queries/requisitionMutations';

type TimeWindow = { start: string; end: string };
interface FormData {
  project: string;
  requisitionPriority: string;
  requisitionComments: string;
  arrivalDate: string;
  sendTo: SendTo[];
  items: LineItem[];
  arrivalWindows: TimeWindow[];
}

const VENDORS = ['proveedor 1', 'proveedor 2', 'proveedor 3'];

export default function RequisitionModal({
  open,
  onClose,

  editingRequisition, // NUEVO: recibe la requisición a editar
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (data: BackendPayload) => Promise<void> | void;
  editingRequisition?: Requisition | null; // NUEVO
}) {
  const { createReq } = useRequisitionMutations();
  const isEditing = !!editingRequisition; // NUEVO: determina si está editando
  const { parseAndFill, extractData } = useExtractItemsFromFile();
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      arrivalWindows: [{ start: '', end: '' }],
    },
  });

  const { items, sendTo, requisitionPriority } = watch();

  useEffect(() => {
    if (extractData) setValue('items', extractData);
  }, [extractData, setValue]);

  useEffect(() => {
    if (attachedFile) parseAndFill(attachedFile);
  }, [attachedFile, parseAndFill]);

  const handleFilesSelected = useCallback((files: FileList | null) => {
    let selectedFile: File | null = null;
    if (files && files.length > 0) {
      selectedFile = files[0];
    }
    setAttachedFile(selectedFile);
  }, []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'arrivalWindows',
  });

  const {
    fields: fieldMaterials,
    append: appendMaterial,
    remove: removeMaterial,
  } = useFieldArray({
    control,
    name: 'items',
  });

  const emptyLineItem: LineItem = {
    material: '',
    metricUnit: '',
    quantity: 0,
    part: '',
    subpart: '',
  };

  const onSubmit = (data: FormData) => {
    if (!editingRequisition) createReq.mutate(data);
  };

  console.log(errors);
  return (
    <Dialog
      isOpen={open}
      title={isEditing ? 'Editar Requisición' : 'Nueva Requisición'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-x-2 [&>div]:w-2/4">
          <Input
            label="Proyecto"
            registration={register('project', {
              required: 'Escribe el nombre del proyecto.',
            })}
            errorMessage={errors.project?.message}
            name="project"
          />
          <Select
            name="requisitionPriority"
            label="Prioridad"
            registration={register('requisitionPriority', {
              required: 'Selecciona la prioridad',
            })}
            errorMessage={errors.requisitionPriority?.message}
            options={Object.entries(PRIORITY).map(([key, value]) => ({
              value: PRIORITY[key as keyof typeof PRIORITY],
              label: capitalizeWords(value),
            }))}
            setValue={setValue}
            currentValue={requisitionPriority}
          />
        </div>

        <Textarea
          label="Comentarios"
          name="requisitionComments"
          registration={register('requisitionComments', {
            required: 'Escribe un comentario',
          })}
          errorMessage={errors.requisitionComments?.message}
        />
        <div className="flex gap-x-2 [&>div]:w-2/4">
          <Input
            label="Fecha de llegada"
            registration={register('arrivalDate', {
              required: 'Selecciona la fecha de llegada',
            })}
            errorMessage={errors.arrivalDate?.message}
            name="arrivalDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
          />
          <div>
            <MultiSelect
              label="Proveedores recomendados"
              name="sendTo"
              options={VENDORS.map(vendor => ({
                value: vendor,
                label: vendor,
              }))}
              setValue={setValue}
              currentValues={sendTo.map(item => item.name)}
              registration={register('sendTo')}
            />
          </div>
        </div>

        <div className="border-y border-gray-200 py-4 my-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className={labelClasses}>Horarios de recepción</h3>
            <button
              type="button"
              onClick={() => append({ start: '', end: '' })}
              className="text-sm text-[#009cb8] hover:text-[#0586a0] flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar rango de horario
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id}>
              <h5 className="text-sm font-semibold text-primaryDark mb-1">
                Rango {index + 1}
              </h5>

              <div className="flex gap-x-2 items-center px-1 pt-2 rounded bg-gray-50 border mb-4">
                <OptionButton
                  buttonHandler={() => remove(index)}
                  title="Eliminar rango"
                >
                  <Trash2 className="w-4 h-4 text-red-primary" />
                </OptionButton>

                <Input
                  label="Desde"
                  registration={register(
                    `arrivalWindows.${index}.start` as const,
                    {
                      required: 'La fecha de inicio es requerida.',
                    }
                  )}
                  errorMessage={errors?.arrivalWindows?.[index]?.start?.message}
                  name={`start-${index}`}
                  type="time"
                />

                <Input
                  label="Hasta"
                  registration={register(
                    `arrivalWindows.${index}.end` as const,
                    {
                      required: 'La fecha de finalización es requerida.',
                      validate: (value, formValues) => {
                        const startDate =
                          formValues.arrivalWindows[index]?.start;
                        if (startDate && value < startDate) {
                          return 'La fecha de fin no puede ser anterior a la de inicio.';
                        }
                        return true;
                      },
                    }
                  )}
                  errorMessage={errors?.arrivalWindows?.[index]?.end?.message}
                  name={`end-${index}`}
                  type="time"
                />
              </div>
            </div>
          ))}

          <ErrorMessage
            errorMessage={errors?.arrivalWindows?.root?.message}
            name="arrivalWindows"
          />
        </div>

        <FileInput
          label="Carga de materiales"
          name="items"
          accept="application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.xls,.xlsx,.csv"
          onFilesSelected={handleFilesSelected}
          errorMessage={errors.items?.message}
        />

        <div className="border-b border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className={labelClasses}>
              Materiales {items?.length > 0 && `(${items?.length})`}
            </h3>

            <button
              type="button"
              onClick={() => appendMaterial(emptyLineItem)}
              className="text-sm text-[#009cb8] hover:text-[#0586a0] flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar ítem
            </button>
          </div>
          <div className="space-y-2">
            {fieldMaterials?.map((field, index) => {
              return (
                <div
                  key={field.id}
                  className="flex gap-1 px-1 py-2 rounded bg-gray-50 border"
                >
                  {lineItemKeys.map(key => {
                    const fieldName = `items.${index}.${key}` as const;
                    let rules = {};

                    if (key === 'quantity') {
                      rules = {
                        required: `${lineItemLabels[key]} es obligatorio.`,
                        valueAsNumber: true,
                        min: {
                          value: 0.0000001,
                          message: `La cantidad debe ser mayor que 0.`,
                        },
                      };
                    } else {
                      rules = {
                        required: {
                          value: true,
                          message:
                            key === 'material'
                              ? 'No tiene nombre, por favor agrega uno.'
                              : key === 'metricUnit'
                              ? 'No tiene unidad, por favor agrega una.'
                              : key === 'part'
                              ? 'No tiene partida, por favor agrega una.'
                              : `${lineItemLabels[key]} es obligatorio.`,
                        },
                      };
                    }

                    return (
                      <div key={key} className="flex-1 min-w-[100px]">
                        <Input
                          label={lineItemLabels[key]}
                          name={fieldName}
                          registration={register(fieldName, rules)}
                          errorMessage={errors.items?.[index]?.[key]?.message}
                          type={key === 'quantity' ? 'number' : 'text'}
                          step="0.0000001"
                        />
                      </div>
                    );
                  })}

                  <OptionButton
                    buttonHandler={() => removeMaterial(index)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-primary" />
                  </OptionButton>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
          <BaseButton
            label={isEditing ? 'Actualizar requisición' : 'Crear requisición'}
            size="md"
            type="submit"
            disabled={!isValid}
          />
        </div>
      </form>
    </Dialog>
  );
}
