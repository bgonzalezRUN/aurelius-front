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
import clsx from 'clsx'; // Asegúrate de tener clsx instalado
import { labelClasses } from './styles';
import ErrorMessage from '../common/ErrorMessage';

// --- Interfaces ---
export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSingleSelectDropdownProps<TFieldValues extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  name: Path<TFieldValues>;
  options: SelectOption[];
  registration: UseFormRegisterReturn;
  setValue: UseFormSetValue<TFieldValues>;
  currentValue: string; // 🎯 Solo un string, no un array
  errorMessage?: string;
  placeholder?: string;
}

/**
 * Componente Select que simula un dropdown (Listbox) para selección simple,
 * permitiendo estilos personalizados de hover/selected.
 */
export const Select = <TFieldValues extends FieldValues>({
  label,
  name,
  options,
  registration,
  setValue,
  currentValue,
  errorMessage,
  placeholder = 'Selecciona una opción...',
  disabled = false,
}: React.PropsWithChildren<FormSingleSelectDropdownProps<TFieldValues>>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Muestra la etiqueta de la opción seleccionada
  const selectedLabel =
    options.find(o => o.value === currentValue)?.label || placeholder;

  // ⚙️ Handler para seleccionar una opción
  const handleSelectOption = (value: string) => {
    // 🎯 Actualizar el valor en React Hook Form
    setValue(name, value as any, { shouldValidate: true, shouldDirty: true });
    setIsOpen(false); // Cerrar el dropdown
  };

  // 🖱️ Hook para cerrar el dropdown al hacer clic fuera
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
    'w-full px-2 py-1 border rounded-lg text-left flex justify-between items-center transition duration-150',
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
          className={currentValue === '' ? 'text-gray-500' : 'text-gray-900'}
        >
          {selectedLabel}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
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
          tabIndex={-1}
        >
          {options.map(option => {
            const isSelected = currentValue === option.value;

            const optionClasses = clsx(
              'p-2 text-sm cursor-pointer transition duration-100',
              'hover:bg-primaryDark hover:text-white',
              {
                'bg-primaryDark text-white hover:bg-primaryDark': isSelected,
                'text-gray-900': !isSelected,
              }
            );

            return (
              <div
                key={option.value}
                className={optionClasses}
                onClick={() => handleSelectOption(option.value)}
                role="option"
                aria-selected={isSelected}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}

      <ErrorMessage errorMessage={errorMessage} name={name} />
    </div>
  );
};
