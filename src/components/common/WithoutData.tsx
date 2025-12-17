import { OctagonAlert } from "lucide-react";

export default function WithoutData({
  message = 'Lo sentimos, no tenemos registros para la consulta que intentas hacer',
}: {
  message?: string;
}) {
  return (
    <div className="w-full h-full p-5 flex flex-col items-center gap-y-5 text-gray-500 justify-center">
        <OctagonAlert size={50} />
      <p className="text-center text-3xl font-bold italic">{message}</p>
    </div>
  );
}
