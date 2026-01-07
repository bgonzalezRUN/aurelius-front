import type { ReactNode } from 'react';

export default function OptionButton({
  buttonHandler, children,
  title
}: {
  buttonHandler?: () => void;
  children?: ReactNode;
  title: string;
}) {
  return (
    <button
      className="p-1.5 rounded-full hover:bg-gray-200 transition cursor-pointer flex items-center justify-center"
      onClick={buttonHandler}
      title={title}
    >
      {children}
    </button>
  );
}
