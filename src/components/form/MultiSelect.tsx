/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  type InputHTMLAttributes,
  useState,
  useRef,
  useEffect,
} from 'react';
import type {
  UseFormRegisterReturn,
  UseFormSetValue,
  FieldValues,
  Path,
} from 'react-hook-form';
import { labelClasses } from './styles';
import clsx from 'clsx';
import ErrorMessage from '../common/ErrorMessage';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps<TFieldValues extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  name: Path<TFieldValues>;
  options: SelectOption[];
  registration: UseFormRegisterReturn;
  setValue: UseFormSetValue<TFieldValues>;
  currentValues: string[];
  errorMessage?: string;
  placeholder?: string;
}

export const MultiSelect = <TFieldValues extends FieldValues>({
  label,
  name,
  options,
  registration,
  setValue,
  currentValues,
  errorMessage,
  placeholder = 'Selecciona opciones...',
  disabled = false,
  ...rest
}: React.PropsWithChildren<MultiSelectProps<TFieldValues>>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    currentValues?.length === 0
      ? placeholder
      : currentValues?.length === 1
      ? options.find(o => o.value === currentValues[0])?.label
      : `${currentValues?.length} seleccionados`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const optionValue = e.target.value;
    const isChecked = e.target.checked;

    let newValues: string[];

    if (isChecked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter(val => val !== optionValue);
    }

    setValue(name, newValues as any, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerClasses = clsx(
    'w-full pl-2 pr-2 pt-1 pb-1 border rounded-lg text-left flex justify-between items-center transition duration-150',

    {
      'border-red-500': errorMessage,
      'border-gray-300 hover:border-primaryDark': !errorMessage,
    },

    {
      'bg-gray-100 cursor-not-allowed': disabled,
      'bg-white cursor-pointer': !disabled,
    }
  );

  const dropdownMenuClasses = `absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto`;

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label htmlFor={`${name}-trigger`} className={labelClasses}>
        {label}
      </label>

      <input
        type="hidden"
        {...registration}
        name={name}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? `${name}-error` : undefined}
      />

      <button
        id={`${name}-trigger`}
        type="button"
        className={triggerClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${name}-listbox`}
      >
        <span
          className={clsx('text-gray-500', {
            'text-gray-900': currentValues?.length,
          })}
        >
          {selectedLabel}
        </span>
        <svg
          className={clsx('w-4 h-4 transition-transform', {
            'rotate-180': isOpen,
          })}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {isOpen && (
        <div
          id={`${name}-listbox`}
          className={dropdownMenuClasses}
          role="listbox"
          aria-multiselectable="true"
        >
          {options.map(option => {
            const isChecked = currentValues.includes(option.value);
            const isDisabled = disabled || option.disabled;
            const optionId = `${name}-${option.value}`;

            return (
              <div
                key={option.value}
                className={clsx(
                  'flex items-center p-2 hover:bg-primary-primary hover:text-white text-gray-700 transition',
                  { 'opacity-50': isDisabled }
                )}
                role="option"
                aria-selected={isChecked}
              >
                <input
                  id={optionId}
                  type="checkbox"
                  value={option.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={handleChange}
                  className="h-4 w-4 text- rounded focus:ring-primaryHover border-gray-300 cursor-pointer"
                  {...rest}
                />
                <label
                  htmlFor={optionId}
                  className={clsx('w-full ml-3 text-sm font-medium', {
                    'text-gray-500': isDisabled,
                    'cursor-pointer': !isDisabled,
                  })}
                >
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>
      )}

      <ErrorMessage errorMessage={errorMessage} name={name} />
    </div>
  );
};
