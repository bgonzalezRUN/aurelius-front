import React, {
  type InputHTMLAttributes,
  useState,
  useRef,
  type ChangeEvent,
} from 'react';
import { Upload } from 'lucide-react';
import { labelClasses } from './styles';
import ErrorMessage from '../common/ErrorMessage';

export interface FileSelection {
  files: FileList | null;
  inputName?: string;
}

export interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string;
  name: string;
  errorMessage?: string;
  containerClassName?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: FileSelection) => void;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      label,
      name,
      errorMessage,
      containerClassName = '',
      accept,
      multiple = false,
      onFilesSelected,
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [documentName, setDocumentName] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const preventDefaults = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
      preventDefaults(e);
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      preventDefaults(e);
      if (!disabled) setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      preventDefaults(e);
      if (disabled) return;

      setIsDragging(false);
      const files = e.dataTransfer.files;

      if (inputRef.current) {
        inputRef.current.files = files;
      }
      setDocumentName(files?.[0]?.name ?? '');
      onFilesSelected({ files });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputName = e.target.name;
      const files = e.target.files;
      const selectionData: FileSelection = {
        files: files,
        inputName: inputName,
      };
      setDocumentName(files?.[0]?.name ?? '');
      onFilesSelected(selectionData);
    };

    const dropAreaClasses = `flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition duration-200 cursor-pointer text-center`;

    const borderColor = errorMessage
      ? 'border-red-500'
      : isDragging
      ? 'border-primaryDark bg-indigo-50'
      : 'border-gray-300 hover:border-primaryDark';

    const disabledClasses = disabled
      ? 'bg-gray-50 opacity-70 cursor-not-allowed'
      : 'bg-white';

    const finalClasses = `${dropAreaClasses} ${borderColor} ${disabledClasses}`;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>

        <div
          className={finalClasses}
          onDragOver={preventDefaults}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            id={name}
            name={name}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            ref={inputRef || ref}
            onChange={handleFileChange}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? `${name}-error` : undefined}
            {...rest}
          />

          <Upload className="text-grey-primary" />
          {!documentName ? (
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-primaryDark">
                Haz clic para seleccionar
              </span>{' '}
              o arrastra y suelta aquí.
            </p>
          ) : (
            <p className="mt-2 text-sm text-primaryDark">{documentName}</p>
          )}
        </div>

        <ErrorMessage errorMessage={errorMessage} name={name} />
      </div>
    );
  }
);
