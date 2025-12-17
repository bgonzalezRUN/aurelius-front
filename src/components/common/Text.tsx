import type { ReactNode } from 'react';

export const H1 = ({ children }: { children: ReactNode | string }) => {
  return (
 

    <h1 className="text-3xl font-extrabold text-primaryDark inline-flex gap-x-3 items-center ">
      {children}
    </h1>
    
  );
};
