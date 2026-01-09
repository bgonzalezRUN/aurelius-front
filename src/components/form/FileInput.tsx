import React, {
  type InputHTMLAttributes,
  useState,
  useRef,
  type ChangeEvent,
  useEffect,
} from 'react';
import { Upload, X } from 'lucide-react'; // Añadimos X para eliminar
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
  currentFiles?: File[];
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
      currentFiles,
      ...rest
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [documentName, setDocumentName] = useState<string>('');
    const internalRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (currentFiles?.length) {
        const names = Array.from(currentFiles)
          .map(file => file.name)
          .join(', ');
        setDocumentName(names);
      }
    }, [currentFiles]);

    // Combinamos la ref de React Hook Form con nuestra ref interna
    const inputRef =
      (ref as React.MutableRefObject<HTMLInputElement>) || internalRef;

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

    const processFiles = (files: FileList | null) => {
      if (files && files.length > 0) {
        const names = Array.from(files)
          .map(file => file.name)
          .join(', ');
        setDocumentName(names);
        onFilesSelected({ files, inputName: name });
        return;
      }

      setDocumentName('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      onFilesSelected({ files: null, inputName: name });
    };

    const handleDrop = (e: React.DragEvent) => {
      preventDefaults(e);
      if (disabled) return;
      setIsDragging(false);

      let files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      if (!multiple && files.length > 1) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        files = dataTransfer.files;
      }
      if (inputRef.current) {
        inputRef.current.files = files;
      }
      processFiles(files);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (files && files.length > 0) {
        processFiles(files);
      }
    };

    const clearSelection = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      processFiles(null);
    };

    const dropAreaClasses = `flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition duration-200 cursor-pointer text-center relative`;
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
          {documentName && !disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute top-2 right-2 p-1 bg-gray-100 hover:bg-red-100 rounded-full transition-colors text-gray-500 hover:text-red-600"
              title="Eliminar archivo"
            >
              <X size={16} />
            </button>
          )}

          <input
            id={name}
            name={name}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            ref={inputRef}
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
            <p className="mt-2 text-sm text-primaryDark font-medium line-clamp-2 px-4">
              {documentName}
            </p>
          )}
        </div>

        <ErrorMessage errorMessage={errorMessage} name={name} />
      </div>
    );
  }
);
