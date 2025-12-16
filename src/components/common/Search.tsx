import { type ChangeEvent, useEffect, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import clsx from 'clsx';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  debounce?: number;
  id?: string;
  disabled?: boolean;
}

export function Search({
  value,
  onChange,
  label = 'Buscar',
  debounce = 300,
  id = 'search-input',
  disabled = false,
}: SearchProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== value) onChange(inputValue);
    }, debounce);

    return () => clearTimeout(handler);
  }, [inputValue, debounce, onChange, value]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  return (
    <div className="relative max-w-96 w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
      <input
        id={id}
        type="search"
        role="searchbox"
        className={clsx(
          'w-full bg-white drop-shadow-lg rounded-lg pl-10 pr-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primaryDark',
          { 'cursor-not-allowed': disabled }
        )}
        value={inputValue}
        onChange={handleChange}
        placeholder={label}
        aria-label={label}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
      />
    </div>
  );
}
