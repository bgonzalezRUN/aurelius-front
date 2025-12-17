import { CircleX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-screen w-svw flex flex-col items-center justify-center text-grey-700 font-bold gap-y-5">
      <CircleX size={50}/>
      <p className='text-6xl'>Página no encontrada</p>
    </div>
  );
}
