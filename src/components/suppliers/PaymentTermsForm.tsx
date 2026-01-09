import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Input, Select } from '../form';
import type { SupplierDTOProps } from '../auth/SupplierForm';
import { Fragment, useEffect, useRef } from 'react';
import { NumericFormat } from 'react-number-format';
import {
  PAYMENT_TERMS_TYPE_ITEM,
  TERM_CONFIG,
  type PAYMENT_TERMS_TYPE,
} from '../../types/paymentTerms';
import { OptionButton } from '../common';
import { Plus, Trash2 } from 'lucide-react';
import type { PaymentTerms } from '../../types/supplier';
import clsx from 'clsx';
import { usePopupStore } from '../../store/popup';
import { toast } from 'sonner';
import { numberOfCreditDays } from '../../types/numberOfCreditDays';

const emptyPaymentTerm: PaymentTerms = {
  paymentTermType: undefined as unknown as PAYMENT_TERMS_TYPE,
  advancePercentage: 0,
  balancePercentage: 0,
  creditPercentage: 0,
  creditDays: 0,
};

export function PaymentTermsForm({
  isDisabled,
  custom,
}: {
  isDisabled?: boolean;
  custom?: boolean;
}) {
  const {
    register,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useFormContext<SupplierDTOProps>();
  const { paymentTerms } = watch();
  const { openPopup: openPopupValidate } = usePopupStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { fields, remove, append } = useFieldArray({
    control,
    name: 'paymentTerms',
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [paymentTerms]);

  const handleDelete = (id: number) => {
    openPopupValidate({
      title: 'Eliminar condición',
      message: `¿Estas seguro de querer eliminar esta condición?`,
      onConfirm: () => {
        remove(id);
      },
    });
  };

  const handleAppend = async () => {
    const isStepValid = await trigger('paymentTerms');
    if (isStepValid) {
      append(emptyPaymentTerm);
    } else {
      toast.error('No se puede agregar una nueva condición', {
        description:
          'Por favor, completa correctamente los campos de las condiciones actuales.',
      });
    }
  };

  return (
    <div key="step-5" ref={scrollRef}>
      {custom ? (
        <div className="flex mb-1">
          <h3 className="text-primaryDark font-bold text-lg ">
            Condiciones de pago
          </h3>
          {!isDisabled && (
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => handleAppend()}
              className={clsx(
                'text-[#009cb8] hover:text-[#0586a0] flex items-center gap-1 transition ml-auto',
                { 'cursor-not-allowed': isDisabled }
              )}
            >
              <Plus size={20} /> Agregar condición
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleAppend()}
          className="text-[#009cb8] hover:text-[#0586a0] flex items-center gap-1 transition ml-auto"
        >
          <Plus size={20} /> Agregar condición
        </button>
      )}

      {fields.map((field, index) => {
        const currentType = paymentTerms[index].paymentTermType;

        return (
          <Fragment key={field.id}>
            <div className="flex items-center justify-between">
              <p className="text-primary-primary font-semibold">
                Condición {index + 1}
              </p>
              {!isDisabled && (
                <OptionButton
                  buttonHandler={() => handleDelete(index)}
                  title="Eliminar condición"
                  disabled={isDisabled}
                >
                  <Trash2 className="text-red-primary" size={20} />
                </OptionButton>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-2 md:gap-y-0">
              <Select
                name={`paymentTerms.${index}.paymentTermType`}
                label="Tipo de condición"
                registration={register(
                  `paymentTerms.${index}.paymentTermType`,
                  {
                    required: 'Selecciona un tipo de condición',
                  }
                )}
                errorMessage={
                  errors?.paymentTerms?.[index]?.paymentTermType?.message
                }
                disabled={isDisabled}
                options={
                  Object.entries(PAYMENT_TERMS_TYPE_ITEM).map(
                    ([key, value]) => ({
                      value: key,
                      label: value,
                    })
                  ) ?? []
                }
                setValue={setValue}
                currentValue={currentType}
                onChange={() => {
                  const config =
                    TERM_CONFIG[
                      paymentTerms[index]
                        .paymentTermType as keyof typeof TERM_CONFIG
                    ];

                  if (config) {
                    if ('adv' in config)
                      setValue(
                        `paymentTerms.${index}.advancePercentage`,
                        config.adv,
                        { shouldValidate: true }
                      );
                    if ('days' in config)
                      setValue(
                        `paymentTerms.${index}.creditDays`,
                        config.days,
                        {
                          shouldValidate: true,
                        }
                      );
                    if ('balance' in config)
                      setValue(
                        `paymentTerms.${index}.balancePercentage`,
                        config.balance,
                        { shouldValidate: true }
                      );
                    if ('credit' in config)
                      setValue(
                        `paymentTerms.${index}.creditPercentage`,
                        config.credit,
                        { shouldValidate: true }
                      );
                  }
                }}
              />
              <Controller
                control={control}
                name={`paymentTerms.${index}.advancePercentage`}
                rules={{
                  validate: val => {
                    if (
                      (currentType === 'ADVANCE_PAYMENT' ||
                        currentType === 'ADVANCE_PAYMENT_CREDIT' ||
                        currentType === 'OUTSTANDING_BALANCE') &&
                      (!val || val <= 0)
                    ) {
                      return 'El porcentaje anticipado no puede ser 0';
                    }
                    return true;
                  },

                  max: { value: 100, message: 'Máximo 100' },
                }}
                render={({ field: { onChange, value, ref, name } }) => (
                  <NumericFormat
                    name={name}
                    value={value}
                    onValueChange={vals => {
                      const val = vals.floatValue ?? 0;
                      onChange(val);
                      if (
                        currentType === 'ADVANCE_PAYMENT' ||
                        currentType === 'ADVANCE_PAYMENT_OUTSTANDING_BALANCE'
                      ) {
                        setValue(
                          `paymentTerms.${index}.balancePercentage`,
                          Math.max(0, 100 - val)
                        );
                      }
                      if (currentType === 'ADVANCE_PAYMENT_CREDIT') {
                        setValue(`paymentTerms.${index}.creditPercentage`, 0);
                        setValue(
                          `paymentTerms.${index}.balancePercentage`,
                          Math.max(0, 100 - val)
                        );
                      }
                    }}
                    getInputRef={ref}
                    customInput={Input}
                    suffix="%"
                    label={
                      currentType === 'ADVANCE_PAYMENT' ||
                      currentType === 'ADVANCE_PAYMENT_OUTSTANDING_BALANCE' ||
                      currentType === 'ADVANCE_PAYMENT_CREDIT'
                        ? 'Pago anticipado'
                        : 'Pago contraentrega'
                    }
                    disabled={
                      TERM_CONFIG[currentType]?.disableAdv || isDisabled
                    }
                    errorMessage={
                      errors?.paymentTerms?.[index]?.advancePercentage?.message
                    }
                  />
                )}
              />
              <Controller
                control={control}
                name={`paymentTerms.${index}.balancePercentage`}
                render={({ field: { onChange, name, value, ref } }) => (
                  <NumericFormat
                    name={name}
                    value={value}
                    onValueChange={vals => onChange(vals.floatValue)}
                    getInputRef={ref}
                    customInput={Input}
                    suffix="%"
                    decimalScale={2}
                    allowNegative={false}
                    label="Porcentaje pendiente"
                    errorMessage={
                      errors?.paymentTerms?.[index]?.balancePercentage?.message
                    }
                    disabled
                  />
                )}
              />

              <Controller
                control={control}
                name={`paymentTerms.${index}.creditPercentage`}
                rules={{
                  validate: val => {
                    if (
                      (currentType === 'CREDIT' ||
                        currentType === 'ADVANCE_PAYMENT_CREDIT') &&
                      (!val || val <= 0)
                    ) {
                      return 'El monto total crédito adjudicado debe ser mayor que 0';
                    }
                    return true;
                  },
                }}
                render={({ field: { onChange, name, value, ref } }) => (
                  <NumericFormat
                    name={name}
                    value={value}
                    onValueChange={vals => onChange(vals.floatValue)}
                    getInputRef={ref}
                    customInput={Input}
                    suffix=" MXN"
                    decimalScale={2}
                    allowNegative={false}
                    label="Monto total crédito adjudicado"
                    errorMessage={
                      errors?.paymentTerms?.[index]?.creditPercentage?.message
                    }
                    disabled={currentType !== 'CREDIT' || isDisabled}
                  />
                )}
              />

              
              <Select
                name={`paymentTerms.${index}.creditDays`}
                label="Días de crédito"
                registration={register(`paymentTerms.${index}.creditDays`, {
                  required: 'Selecciona los días de crédito',
                })}
                errorMessage={
                  errors?.paymentTerms?.[index]?.creditDays?.message
                }
                disabled={isDisabled}
                options={
                  numberOfCreditDays.map(value => ({
                    value: value.toString(),
                    label: value.toString(),
                  })) ?? []
                }
                setValue={setValue}
                currentValue={paymentTerms?.[index]?.creditDays?.toString() ?? ''}
              />
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
