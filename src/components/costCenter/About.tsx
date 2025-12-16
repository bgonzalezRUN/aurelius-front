import { CircleAlert, File } from 'lucide-react';
import { useCostCenterById } from '../../api/queries/costCenterQuery';
import { getFileDetails } from '../../utils/getDetailsOfTheCCFile';

export default function About({ id }: { id: string }) {
  const { data } = useCostCenterById(id);
  const documents = [
    {
      name: 'Calendario operativo:',
      details: getFileDetails(data?.costCenterCalender as string),
    },
    {
      name: 'Presupuesto base:',
      details: getFileDetails(data?.costCenterBudget as string[]),
    },
    {
      name: 'Reglas fiscales:',
      details: getFileDetails(data?.costCenterRules as string[]),
    },
  ];

  if (!data) return null;

  return (
    <div className="bg-white rounded-lg max-h-[22rem] w-full p-5 flex flex-col gap-y-2 text-grey-primary font-semibold">
      <div className="flex justify-between">
        <p className="inline-flex items-center gap-x-1 text-secondary font-bold">
          <CircleAlert size={15} /> {data.costCenterName}
        </p>
        <p className="inline-flex items-center gap-x-3  font-bold">
          <span className="text-secondary">Código:</span> {data.costCenterCode}
        </p>
      </div>
      <p>
        <span className="text-secondary font-bold">Ubicación: </span>
        {data.costCenterAddress}
      </p>
      <p>
        <span className="text-secondary font-bold">Descripción: </span>
        {data.costCenterDescription}
      </p>
      {documents.map(document => (
        <div className='flex w-full'>
          <p key={document.name} className="text-secondary font-bold w-1/6">
            {document.name}
          </p>
          <p className='inline-flex items-center gap-x-1'>
            {document.details.map(item => (
                <>
              <span className="text-secondary font-bold inline-flex items-center gap-x-1">
                <File size={15} /> {item.name}
              </span>
              (<span>{item.type}</span>)
                </>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}
