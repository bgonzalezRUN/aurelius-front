import clsx from 'clsx';
import { type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'primaryDark' | 'red';
type ButtonSize = 'xs' | 'sm' | 'md';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-primary text-white hover:bg-primaryHover',
  secondary: 'bg-grey-300 text-white hover:bg-gray-300',
  primaryDark: 'bg-primaryDark text-white hover:bg-primary-200',
  red: 'bg-red-primary text-white hover:opacity-80',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-3 py-1',
  md: 'text-md px-4 py-2',
};

export default function ButtonBase({
  label,
  onclick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'xs',
  isLoading = false,
}: {
  label: string | ReactNode;
  onclick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}) {
  const variantClasses = variantStyles[variant];
  const sizeClasses = sizeStyles[size];

  return (
    <button
      className={clsx(
        `flex gap-x-3 items-center rounded-md font-semibold cursor-pointer ${variantClasses} ${sizeClasses} disabled:opacity-50 disabled:cursor-not-allowed`,
        typeof label === 'string' && 'justify-center'
      )}
      onClick={onclick}
      disabled={disabled || isLoading}
      type={type}
    >
      {typeof label !== 'string' ? (
        <>{label}</>
      ) : (
        <> {`${label} ${isLoading ? '...' : ''}`}</>
      )}
    </button>
  );
}
