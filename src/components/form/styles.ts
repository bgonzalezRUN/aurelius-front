import clsx from 'clsx';
export const baseClasses = (isItBig) => {
  return clsx(
    'block w-full  px-2 py-1 border rounded-lg focus:outline-none transition duration-150 ease-in-out',
    { 'text-xs': isItBig  }
  );
};

export const errorClasses = (errorMessage: string) => {
  return errorMessage
    ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-primaryDark focus:border-primaryDark';
};

export const disabledClasses = (disabled: boolean) => {
  return disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white';
};

export const labelClasses = 'block text-sm font-bold text-grey-100 mb-1';
