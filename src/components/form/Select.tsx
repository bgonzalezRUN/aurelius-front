/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  type InputHTMLAttributes,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { Popper } from 'react-popper';
import type {
  UseFormRegisterReturn,
  UseFormSetValue,
  FieldValues,
  Path,
} from 'react-hook-form';
import clsx from 'clsx';
import { labelClasses } from './styles';
import ErrorMessage from '../common/ErrorMessage';


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
  currentValue: string;
  errorMessage?: string;
  placeholder?: string;
}

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
  const triggerRef = useRef<HTMLButtonElement>(null); 

  const selectedLabel =
    options.find(o => o.value === currentValue)?.label || placeholder;

  const handleSelectOption = useCallback(
    (value: string) => {
      setValue(name, value as any, { shouldValidate: true, shouldDirty: true });
      setIsOpen(false);
    },
    [name, setValue]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        const popperElements = document.querySelectorAll('[data-popper]');
        let clickedOnPopper = false;

        popperElements.forEach(element => {
          if (element.contains(event.target as Node)) {
            clickedOnPopper = true;
          }
        });

        if (!clickedOnPopper) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

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

  return (
    <div className="mb-4">
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
        ref={triggerRef}
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

      {isOpen &&
        triggerRef.current &&
        createPortal(
          <Popper
            referenceElement={triggerRef.current}
            placement="bottom-start"
            modifiers={[
              {
                name: 'offset',
                options: {
                  offset: [0, 8],
                },
              },
              {
                name: 'preventOverflow',
                options: {
                  padding: 8,
                  boundary: 'clippingParents',
                },
              },
              {
                name: 'flip',
                options: {
                  fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                },
              },
            ]}
          >
            {({ ref, style, placement }) => (
              <div
                ref={ref}
                style={{
                  ...style,
                  width: triggerRef.current?.offsetWidth,
                }}
                className="z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                role="listbox"
                id={`${name}-listbox`}
                tabIndex={-1}
                data-popper
                data-placement={placement}
              >
                {options.map(option => {
                  const isSelected = currentValue === option.value;

                  const optionClasses = clsx(
                    'p-2 text-sm cursor-pointer transition duration-100',
                    'hover:bg-primary-primary hover:text-white',
                    {
                      'bg-primary-primary text-white hover:bg-primary-primary':
                        isSelected,
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
          </Popper>,
          document.body
        )}

      <ErrorMessage errorMessage={errorMessage} name={name} />
    </div>
  );
};
