import { UserX } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="h-screen w-svw flex flex-col items-center justify-center text-grey-700 font-bold gap-y-5">
      <UserX size={50}/>
      <p className='text-6xl'>No está autorizado para visitar esta página</p>
    </div>
  )
}
