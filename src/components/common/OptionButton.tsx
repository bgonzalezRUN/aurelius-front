import type { ReactNode } from 'react';

export default function OptionButton({
  buttonHandler, children
}: {
  buttonHandler: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      className="p-1.5 rounded-full hover:bg-gray-200 transition cursor-pointer flex items-center justify-center"
      onClick={buttonHandler}
    >
      {children}
    </button>
  );
}
