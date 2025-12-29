import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import {
  lineItemKeys,
  lineItemLabels,
  PRIORITY,
  type BackendPayload,
  type LineItem,
  type SendTo,
  type TimeWindow,
} from '../types';
import { BaseButton, Dialog, OptionButton } from './common';
import {
  MultiSelect,
  FileInput,
  Input,
  Select,
  Textarea,
  type FileSelection,
} from './form';

import { capitalizeWords } from '../utils';
import useExtractItemsFromFile from '../hooks/useExtractItemsFromFile';
import { labelClasses } from './form/styles';
import ErrorMessage from './common/ErrorMessage';
import { useRequisitionMutations } from '../api/queries/requisitionMutations';
import { toInputDate, toISOFromDateAndTime } from '../utils/dateformatter';
import {
  useCategories,
  useRequisitionById,
} from '../api/queries/requisitionQueries';
import { toInputTime } from '../utils/time';
import { CATEGORYITEM, type Category } from '../types/category';
import { getLeadingNumber } from '../utils/number';
import { useParams } from 'react-router-dom';
import { useCostCenterById } from '../api/queries/costCenterQuery';

const emptyLineItem: LineItem = {
  material: '',
  metricUnit: '',
  quantity: '0',
};

const VENDORS = ['proveedor 1', 'proveedor 2', 'proveedor 3'];

export default function RequisitionModal({
  open,
  onClose,
  isEditing,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (data: BackendPayload) => Promise<void> | void;
  isEditing?: string | null;
}) {
  const { data } = useRequisitionById(isEditing ?? '');
  const { data: categoriesData } = useCategories();
  const { createReq, updateReq } = useRequisitionMutations();
  const { parseAndFill, extractData } = useExtractItemsFromFile();
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const { costCenterId } = useParams();
  const { data: cc } = useCostCenterById(costCenterId || '');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid, dirtyFields },
  } = useForm<BackendPayload>({
    defaultValues: isEditing
      ? {
          ...data,
          arrivalDate: toInputDate(data?.arrivalDate || ''),
          arrivalWindows: data?.arrivalWindows.map((arrival: TimeWindow) => ({
            start: toInputTime(arrival.start),
            end: toInputTime(arrival.end),
          })),
          sendTo: data?.sendTo.map((item: SendTo) => item.name),
          categories: data?.categories.map(
            category => `${category.categoryId}${category.categoryName}`
          ),
        }
      : {
          arrivalWindows: [{ start: '', end: '' }],
          sendTo: [],
          categories: [],
        },
  });

  const { items, sendTo, requisitionPriority, categories } = watch();

  useEffect(() => {
    if (extractData) setValue('items', extractData);
  }, [extractData, setValue]);

  useEffect(() => {
    if (attachedFile) parseAndFill(attachedFile);
  }, [attachedFile, parseAndFill]);

  useEffect(() => {
    if (createReq.isSuccess) onClose();
    if (updateReq.isSuccess) onClose();
  }, [createReq.isSuccess, updateReq.isSuccess, onClose]);

  const handleFilesSelected = useCallback((data: FileSelection) => {
    let selectedFile: File | null = null;
    if (data?.files && data?.files?.length > 0) {
      selectedFile = data?.files[0];
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

  const onSubmit = (data: BackendPayload) => {
    const dataFormated = {
      ...data,
      arrivalDate: toISOFromDateAndTime(data.arrivalDate, '00:00'),
      arrivalWindows: data.arrivalWindows.map(w => ({
        start: toISOFromDateAndTime(data.arrivalDate, w.start),
        end: toISOFromDateAndTime(data.arrivalDate, w.end),
      })),
      sendTo: data?.sendTo?.map(item => ({ name: item })) as SendTo[],
      items: data.items.map(item => ({
        ...item,
        quantity: String(item.quantity),
      })),
      categories: data?.categories?.map(category => ({
        categoryId: getLeadingNumber(category.toString()),
      })) as Partial<Category>[],
      costCenter: {
        costCenterId: Number(costCenterId),
      },
    };

    const dataFormatedEdit = {
      requisitionPriority: data.requisitionPriority,
      requisitionComments: data.requisitionComments,
      arrivalDate: toISOFromDateAndTime(data.arrivalDate, '00:00'),
      arrivalWindows: data.arrivalWindows.map(w => ({
        start: toISOFromDateAndTime(data.arrivalDate, w.start),
        end: toISOFromDateAndTime(data.arrivalDate, w.end),
      })),
      sendTo: data.sendTo.map(item => ({ name: item })) as SendTo[],
      items: data.items.map(item => ({
        ...item,
        quantity: String(item.quantity),
      })),
      categories: data?.categories?.map(category => ({
        categoryId: getLeadingNumber(category.toString()),
      })) as Partial<Category>[],
      costCenter: {
        costCenterId: Number(costCenterId),
      },
    };
    if (!isEditing) {
      createReq.mutate(dataFormated);

      return;
    }

    updateReq.mutate({ requisitionId: isEditing, data: dataFormatedEdit });
  };

  return (
    <Dialog
      isOpen={open}
      title={isEditing ? 'Editar Requisición' : 'Nueva Requisición'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="hidden"
          {...register('items', {
            required: 'Debes agregar materiales',
          })}
        />
        <input
          type="hidden"
          {...register('arrivalWindows', {
            required: 'Debes seleccionar al menos un horario de recepción',
          })}
        />

        <div className="flex gap-x-2 [&>div]:w-2/4">
          <Input
            label="Proyecto"
            value={cc?.costCenterName}
            name="project"
            disabled
          />
          <Select
            name="requisitionPriority"
            label="Prioridad"
            registration={register('requisitionPriority', {
              required: 'Selecciona la prioridad',
            })}
            errorMessage={errors.requisitionPriority?.message}
            options={Object.entries(PRIORITY)?.map(([key, value]) => ({
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
          registration={register('requisitionComments')}
          errorMessage={errors.requisitionComments?.message}
        />
        <div className="flex gap-x-2 [&>div]:w-2/4">
          <Input
            label="Fecha de llegada"
            registration={register('arrivalDate', {
              required: 'Selecciona la fecha de llegada',
              validate: value => {
                const selectedDate = new Date(value);
                selectedDate.setMinutes(
                  selectedDate.getMinutes() + selectedDate.getTimezoneOffset()
                );
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                return (
                  selectedDate >= today ||
                  'La fecha no puede ser anterior a hoy'
                );
              },
            })}
            errorMessage={errors.arrivalDate?.message}
            name="arrivalDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
          />
          <div>
            <MultiSelect
              label="Categorias"
              name="categories"
              options={
                categoriesData?.map(({ categoryName, categoryId }) => ({
                  value: `${categoryId}${categoryName}`,
                  label: capitalizeWords(CATEGORYITEM[Number(categoryId)]),
                })) ?? []
              }
              setValue={setValue}
              currentValues={categories as string[]}
              registration={register('categories')}
            />
          </div>
        </div>
        <MultiSelect
          label="Proveedores recomendados"
          name="sendTo"
          options={VENDORS.map(vendor => ({
            value: vendor,
            label: vendor,
          }))}
          setValue={setValue}
          currentValues={sendTo as string[]}
          registration={register('sendTo')}
        />

        <div className="border-y border-gray-200 py-4 mb-4 mt-6">
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

          {fields.map((field: TimeWindow, index: number) => (
            <div key={`${field.start}-${field.end}`}>
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
                      validate: (value: string, formValues: BackendPayload) => {
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
        />

        <div className="pt-4 mt-4">
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
            {fieldMaterials?.map((field: LineItem, index: number) => {
              return (
                <div
                  key={`${field.material}-${index}`}
                  className="flex items-center gap-1 px-1 py-2 rounded bg-gray-50 border"
                >
                  {lineItemKeys?.map(key => {
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
                          isItBig
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
          <ErrorMessage
            errorMessage={errors?.items?.root?.message}
            name="items"
          />
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
          <BaseButton
            label={isEditing ? 'Actualizar requisición' : 'Crear requisición'}
            size="md"
            type="submit"
            disabled={
              isEditing ? !isValid || !Object.keys(dirtyFields).length : false
            }
          />
        </div>
      </form>
    </Dialog>
  );
}
