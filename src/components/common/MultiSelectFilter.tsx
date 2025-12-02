import React, {
  useState,
  useRef,
  useEffect,
  type FC,
  useCallback,
} from 'react';
import clsx from 'clsx';
import { BaseButton } from '.';
import { labelClasses } from '../form/styles';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectFilterProps {
  label: string;
  options: SelectOption[];
  selectedValues: string[];
  onValuesChange: (newValues: string[]) => void;
  placeholder?: string;
}

export const MultiSelectFilter: FC<MultiSelectFilterProps> = ({
  label,
  options,
  selectedValues,
  onValuesChange,
  placeholder = 'Selecciona filtros...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<string[]>(selectedValues);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedLabel = () => {
    if (values.length === 0) return placeholder;

    if (values.length === 1) {
      return options.find(o => o.value === values[0])?.label;
    }

    return `${values.length} seleccionados`;
  };

  const selectedLabel = getSelectedLabel();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const optionValue = e.target.value;
    const isChecked = e.target.checked;

    const newValues = isChecked
      ? [...values, optionValue]
      : values.filter(v => v !== optionValue);

    setValues(newValues);
  };

  const handleFilter = useCallback(() => {
    onValuesChange(values);
  }, [onValuesChange, values]);

  const triggerClasses = clsx(
    'w-full px-2 py-1 border rounded-lg text-left flex justify-between items-center transition duration-150',
    'border-gray-300 hover:border-primaryDark',
    'bg-white cursor-pointer'
  );

  const dropdownMenuClasses =
    'absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto';

  return (
    <div className="flex items-end gap-6" ref={dropdownRef}>
      <div className="w-full relative">
        <label className={labelClasses}>
          {label}
        </label>

        <button
          type="button"
          className={triggerClasses}
          onClick={() => setIsOpen(prev => !prev)}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span
            className={
              values.length === 0 ? 'text-gray-500' : 'text-gray-900'
            }
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
            className={dropdownMenuClasses}
            role="listbox"
            aria-multiselectable="true"
          >
            {options.map(option => {
              const isChecked = values.includes(option.value);

              return (
                <div
                  key={option.value}
                  className="flex items-center p-2 hover:bg-primary-primary hover:text-white text-gray-700 transition"
                  role="option"
                  aria-selected={isChecked}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={isChecked}
                    onChange={handleChange}
                    className="h-4 w-4 text-primaryDark rounded focus:ring-primary-primary border-gray-300"
                  />
                  <label className="ml-3 text-sm font-medium  cursor-pointer">
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BaseButton label="Filtrar" size="md" onclick={handleFilter} />
    </div>
  );
};
