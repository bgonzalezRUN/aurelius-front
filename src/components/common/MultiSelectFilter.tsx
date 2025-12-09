import React, {
  useState,
  useRef,
  useEffect,
  type FC,
  useCallback,
} from 'react';

import { BaseButton } from '.';

import { SlidersHorizontal } from 'lucide-react';

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
  options,
  selectedValues,
  onValuesChange,
  placeholder = 'Seleccionar filtros:',
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

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        className="h-11 w-[51px] bg-primary-primary rounded-[10px] p-2"
        onClick={() => setIsOpen(prev => !prev)}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal color="white" width="100%" height="100%" />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 z-10 mt-1 h-80 w-max max-w-52 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto px-3 py-4 flex flex-col items-start justify-between gap-y-3 [&>*:last-child]:mx-auto"
          role="listbox"
          aria-multiselectable="true"
        >
          <span className="text-gray-700">{selectedLabel}</span>

          <div className="max-h-60 overflow-auto">
            {options.map(option => {
              const isChecked = values.includes(option.value);

              return (
                <div
                  key={option.value}
                  className="flex items-center py-2 px-1 hover:bg-primary-primary hover:text-white text-gray-700 transition"
                  role="option"
                  aria-selected={isChecked}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={isChecked}
                    onChange={handleChange}
                    className="h-4 w-4 flex-shrink-0 text-primaryDark rounded focus:ring-primary-primary border-gray-300"
                  />

                  <label className="ml-3 text-sm font-medium cursor-pointer">
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>

          <BaseButton
            label="Aplicar filtros"
            size="md"
            onclick={handleFilter}
          />
        </div>
      )}
    </div>
  );
};
