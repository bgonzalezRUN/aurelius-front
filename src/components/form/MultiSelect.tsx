/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  type InputHTMLAttributes,
  useState,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom'; 
import { usePopper } from 'react-popper';
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
  currentValues = [],
  errorMessage,
  placeholder = 'Selecciona opciones...',
  disabled = false,
  ...rest
}: React.PropsWithChildren<MultiSelectProps<TFieldValues>>) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
    strategy: 'fixed', 
    modifiers: [
      { name: 'offset', options: { offset: [0, 4] } },
      { name: 'preventOverflow', options: { padding: 8 } },
    ],
  });

  const selectedLabel = useMemo(() => {
    if (!currentValues || currentValues.length === 0) return placeholder;
    if (currentValues.length === 1) {
      return options.find(o => o.value === currentValues[0])?.label || placeholder;
    }
    return `${currentValues.length} seleccionados`;
  }, [currentValues, options, placeholder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const optionValue = e.target.value;
    const isChecked = e.target.checked;
    const newValues = isChecked
      ? [...currentValues, optionValue]
      : currentValues.filter(val => val !== optionValue);

    setValue(name, newValues as any, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target as Node) &&
        popperElement && !popperElement.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, popperElement]);

  const dropdownMenu = (
    <div
      ref={setPopperElement}
      style={{ ...styles.popper, minWidth: referenceElement?.offsetWidth, zIndex: 9999 }}
      {...attributes.popper}
      className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto py-1"
      id={`${name}-listbox`}
      role="listbox"
    >
      {options.map((option) => {
        const isChecked = currentValues.includes(option.value);
        const isDisabled = disabled || option.disabled;
        return (
          <label
            key={option.value}
            className={clsx(
              'flex items-center px-3 py-2 text-sm transition-colors cursor-pointer',
              isChecked ? 'bg-primaryDark/5' : 'hover:bg-gray-50',
              { 'opacity-50 cursor-not-allowed': isDisabled }
            )}
          >
            <input
              type="checkbox"
              value={option.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primaryDark focus:ring-primaryDark transition cursor-pointer"
              {...rest}
            />
            <span className={clsx('ml-3 select-none', isChecked ? 'font-semibold text-primaryDark' : 'text-gray-700')}>
              {option.label}
            </span>
          </label>
        );
      })}
      {options.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-500 italic">No hay opciones</div>
      )}
    </div>
  );

  return (
    <div className="mb-4 flex flex-col relative" ref={containerRef}>
      <label htmlFor={`${name}-trigger`} className={labelClasses}>{label}</label>      
      <input type="hidden" {...registration} />

      <button
        ref={setReferenceElement}
        id={`${name}-trigger`}
        type="button"
        className={clsx(
          'w-full pl-3 pr-2 py-2 border rounded-lg text-left flex justify-between items-center transition-all duration-200 outline-none focus:ring-1 focus:ring-primaryDark/20',
          {
            'border-red-500 ring-red-100': errorMessage,
            'border-gray-300 hover:border-primaryDark focus:border-primaryDark': !errorMessage,
            'bg-gray-100 cursor-not-allowed opacity-75': disabled,
            'bg-white cursor-pointer': !disabled,
          }
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={clsx('truncate mr-2', currentValues.length ? 'text-gray-900' : 'text-gray-400')}>
          {selectedLabel}
        </span>
        <svg className={clsx('w-5 h-5 text-gray-400 transition-transform', { 'rotate-180': isOpen })} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

         {isOpen && createPortal(dropdownMenu, document.body)}

      <ErrorMessage errorMessage={errorMessage} name={name} />
    </div>
  );
};