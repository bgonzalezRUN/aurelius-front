import { type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primaryDark text-white hover:bg-primaryHover',
  secondary: 'bg-grey-300 text-white hover:bg-gray-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1',
};

export default function ButtonBase({
  label,
  onclick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'sm',
  isLoading = false,
}: {
  label: string | ReactNode;
  onclick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  isLoading?: boolean;
}) {
  const variantClasses = variantStyles[variant];
  const sizeClasses = sizeStyles[size];

  return (
    <button
      className={`rounded-md font-semibold cursor-pointer ${variantClasses} ${sizeClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={onclick}
      disabled={disabled}
      type={type}
    >
      {`${label} ${isLoading ? '...': ''}`}
    </button>
  );
}
