import  {
  useState,
  useRef,
  useEffect,
  type FC,
  useCallback,
} from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { BaseButton } from '.';


export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  id: string; // Ej: 'status' o 'categories'
  label: string;
  options: SelectOption[];
}

export interface MultiSelectFilterProps {
  groups: FilterGroup[];
  selectedValues: Record<string, string[]>; // Ej: { status: ['active'], categories: ['1'] }
  onValuesChange: (newValues: Record<string, string[]>) => void;
  placeholder?: string;
}

export const MultiSelectFilter: FC<MultiSelectFilterProps> = ({
  groups,
  selectedValues,
  onValuesChange,
  placeholder = 'Filtros seleccionados'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Estado interno local para manejar los cambios antes de "Aplicar"
  const [localValues, setLocalValues] = useState<Record<string, string[]>>(selectedValues);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizar estado local si las props cambian externamente
  useEffect(() => {
    setLocalValues(selectedValues);
  }, [selectedValues]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (groupId: string, optionValue: string, isChecked: boolean) => {
    setLocalValues(prev => {
      const currentGroupValues = prev[groupId] || [];
      const newGroupValues = isChecked
        ? [...currentGroupValues, optionValue]
        : currentGroupValues.filter(v => v !== optionValue);

      return {
        ...prev,
        [groupId]: newGroupValues
      };
    });
  };

  const handleApply = useCallback(() => {
    onValuesChange(localValues);
    setIsOpen(false);
  }, [onValuesChange, localValues]);

  const totalSelected = Object.values(localValues).flat().length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        className="h-11 w-[51px] bg-primary-primary rounded-[10px] p-2 relative"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <SlidersHorizontal color="white" width="100%" height="100%" />
        {totalSelected > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            {totalSelected}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 z-20 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {totalSelected === 0 ? placeholder : `${totalSelected} seleccionados`}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-3 flex flex-col gap-y-6">
            {groups.map(group => (
              <div key={group.id} className="flex flex-col gap-y-2">
                <h4 className="text-sm font-bold text-primary-primary border-b border-gray-100 pb-1">
                  {group.label}
                </h4>
                <div className="flex flex-col">
                  {group.options.map(option => {
                    const isChecked = (localValues[group.id] || []).includes(option.value);
                    return (
                      <label 
                        key={option.value} 
                        className="flex items-center py-1.5 px-1 hover:bg-gray-50 rounded cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleChange(group.id, option.value, e.target.checked)}
                          className="h-4 w-4 text-primaryDark rounded border-gray-300 focus:ring-primary-primary"
                        />
                        <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
            <BaseButton
              label="Aplicar filtros"
              size="md"
              onclick={handleApply}
            />
          </div>
        </div>
      )}
    </div>
  );
};