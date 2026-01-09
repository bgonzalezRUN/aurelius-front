import clsx from 'clsx';
import type { ReactNode } from 'react';

export default function OptionButton({
  buttonHandler, children,
  title,
  disabled
}: {
  buttonHandler?: () => void;
  children?: ReactNode;
  title: string;
  disabled?:boolean
}) {
  return (
    <button
      className={clsx("p-1.5 rounded-full hover:bg-gray-200 transition flex items-center justify-center", {'cursor-not-allowed': disabled})}
      onClick={buttonHandler}
      title={title}
      disabled={disabled}
      type='button'
    >
      {children}
    </button>
  );
}
