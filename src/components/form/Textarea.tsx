import React, { type TextareaHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import {
  baseClasses,
  disabledClasses,
  errorClasses,
  labelClasses,
} from './styles';
import ErrorMessage from '../common/ErrorMessage';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  registration: UseFormRegisterReturn;
  errorMessage?: string;
  containerClassName?: string;
  textareaClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    name,
    registration,
    errorMessage,
    containerClassName = '',
    textareaClassName = '',
    disabled = false,
    rows = 3,
    ...rest
  }, ref) => {
    return (
      <div className={`mb-4 ${containerClassName}`}>
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>

        <textarea
          id={name}
          rows={rows}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${name}-error` : undefined}
          className={`${baseClasses} ${errorClasses(
            errorMessage || ''
          )} ${disabledClasses(disabled)} ${textareaClassName}`}
          {...rest}
          {...registration}
           ref={registration?.ref||ref}
        />

        <ErrorMessage errorMessage={errorMessage} name={name} />
      </div>
    );
  }
);
