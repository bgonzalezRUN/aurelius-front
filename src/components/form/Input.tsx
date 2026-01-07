import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import {
  baseClasses,
  disabledClasses,
  errorClasses,
  labelClasses,
} from './styles';
import ErrorMessage from '../common/ErrorMessage';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  registration?: UseFormRegisterReturn;
  errorMessage?: string;
  containerClassName?: string;
  inputClassName?: string;
  isItBig?: boolean;
}

export const Input = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      name,
      registration,
      errorMessage,
      containerClassName = '',
      inputClassName = '',
      type = 'text',
      disabled = false,
      isItBig = false,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className={clsx(`${containerClassName} w-full`, { 'mb-4': !errorMessage })}>
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>

        <div className={isPassword ? 'relative' : ''}>
          <input
            id={name}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            disabled={disabled}
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? `${name}-error` : undefined}
            className={clsx(
              baseClasses(isItBig),
              errorClasses(errorMessage || ''),
              disabledClasses(disabled),
              inputClassName,
              {
                'pr-10': isPassword,
              }
            )}
            {...rest}
            {...registration}
            ref={registration?.ref || ref}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        <ErrorMessage errorMessage={errorMessage} name={name} />
      </div>
    );
  }
);
