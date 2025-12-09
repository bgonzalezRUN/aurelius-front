import { forwardRef, type InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import {
  baseClasses,
  disabledClasses,
  errorClasses,
  labelClasses,
} from './styles';
import ErrorMessage from '../common/ErrorMessage';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  registration?: UseFormRegisterReturn;
  errorMessage?: string;
  containerClassName?: string;
  inputClassName?: string; 
   isItBig?: boolean
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
      isItBig=false,
      ...rest
    },
   ref
  ) => {
    return (
      <div className={`mb-4 ${containerClassName}`}>
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>

        <input
          id={name}
          type={type}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${name}-error` : undefined}
          className={`${baseClasses(isItBig)} ${errorClasses(
            errorMessage || ''
          )} ${disabledClasses(disabled)} ${inputClassName}`}
          {...rest}
          {...registration}
          ref={registration?.ref||ref}
          
        />

        <ErrorMessage errorMessage={errorMessage} name={name} />
      </div>
    );
  }
);
