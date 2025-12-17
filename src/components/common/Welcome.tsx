import { IdCardLanyard } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="w-full h-full p-5 flex flex-col items-center gap-y-5 text-primaryDark justify-center">
      <IdCardLanyard size={50} />
      <p className="text-center text-3xl font-bold italic">
        Bienvenido al sistema de Gestion de Aurelius, en el panel lateral podrá
        navegar por centro de costos
      </p>
    </div>
  );
}
