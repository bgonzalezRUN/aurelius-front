import { useRequisitionById } from '../../api/queries/requisitionQueries';
import { CATEGORYITEM } from '../../types/category';
import { VIEW } from '../../types/view';
import { capitalizeWords } from '../../utils';
import { dateformatter } from '../../utils/dateformatter';
import { fmtTime } from '../../utils/time';
import { StatusBadge } from '../common/StatusBadge';
import RequisitionButtons from './RequisitionButtons';

export default function RequisitionItemList({
  requisitionId,
}: {
  requisitionId: string;
}) {
  const { data } = useRequisitionById(requisitionId);
  if (!data) return null;

  const baseStyles = 'text-base font-semibold text-grey-primary';

  const requisitionDetails = {
      supplier: (
      <span className={baseStyles}>
        {data.requisitionCode}
      </span>
    ),
    name: (
      <span
        className="text-base font-bold text-secondary line-clamp-2"
        title={capitalizeWords(data.project)}
      >
        {capitalizeWords(data.project)}
      </span>
    ),
    date: (
      <span className={baseStyles} >
        {data.arrivalDate ? dateformatter(new Date(data.arrivalDate)) : 'N/A'}
      </span>
    ),  
    arrivalWindows: (
      <span className={baseStyles}>
        {fmtTime(data.arrivalWindows[0].start)} –{' '}
        {fmtTime(data.arrivalWindows[0].end)}
      </span>
    ),
    category: (
      <span className="flex">
        <span className={`${baseStyles} line-clamp-1`}>
          {capitalizeWords(CATEGORYITEM[Number(data?.categories[0]?.categoryId)])||'Sin categorías'}
        </span>
        {data.categories.length > 1 && (
          <span className={baseStyles}>
           
            {` +${data.categories.length - 1}`}
          </span>
        )}
      </span>
    ),
    priority: (
      <span className={baseStyles}>
        {capitalizeWords(data.requisitionPriority)}
      </span>
    ),
    items: <span className={baseStyles}>{data.items.length}</span>,
    comments: (
      <span className={`${baseStyles} line-clamp-2`}>
        {data.requisitionComments || 'No hay comentarios'}
      </span>
    ),
    status: <StatusBadge status={data.requisitionStatus} />,
  };
  return (
    <article className="w-full h-[9.375rem] bg-white rounded-[10px] shadow-sm p-4 hover:shadow-md transition flex flex-col justify-between">
      <div className="flex [&>*]:flex-1 items-start gap-x-3 border-b border-grey-primary pb-3 h-[50%]">
        {Object.entries(requisitionDetails).map(([, valor]) => (
          <>{valor}</>
        ))}
      </div>
      <div className='pt-3'>
        <RequisitionButtons
          requisitionId={requisitionId}
          viewType={VIEW.LIST}
        />
      </div>
    </article>
  );
}
