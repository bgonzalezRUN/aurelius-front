import { useCostCenterById } from '../../api/queries/costCenterQuery';
import { File, FolderDot, FolderOpenDot, UserStar } from 'lucide-react';
import { paths } from '../../paths';
import clsx from 'clsx';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

export default function CCItem({
  costCenterId,
  isOpen,
  setIsOpen,
}: {
  costCenterId: string;
  isOpen: boolean;
  setIsOpen: (value: number) => void;
}) {
  const { data } = useCostCenterById(costCenterId);
  const { costCenterId: costCenterIdParam } = useParams();
  const location = useLocation();
  const { getUser } = useAuthStore();
  const user = getUser();
  const isActive = Number(costCenterId) === Number(costCenterIdParam);
  const open = isOpen || isActive;

  const internalRoutesAdmin = [
    {
      path: `${data?.costCenterId}${paths.REQUISITIONS}`,
      label: 'Requisiciones',
      icon: <File size={20} />,
      key: paths.REQUISITIONS
    },
    {
      path: `${paths.CC}/${data?.costCenterId}/${paths.MANAGE}`,
      label: 'Administrar',
      icon: <UserStar size={20} />,
      key: paths.MANAGE
    },
  ];

  const internalRoutesNoAdmin = [
    {
      path: `${data?.costCenterId}${paths.REQUISITIONS}`,
      label: 'Requisiciones',
      icon: <File size={20} />,
      key: paths.REQUISITIONS
    },
  ];

  const internalRoutes = user?.role === 'ACC'
    ? internalRoutesAdmin
    : internalRoutesNoAdmin;

  if (!data) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(Number(costCenterId))}
        className="flex items-center gap-x-2 text-secondary font-semibold line-clamp-2"
      >
        {open ? (
          <FolderOpenDot className="flex-none" />
        ) : (
          <FolderDot className="flex-none" />
        )}
        <span className="text-start">{data.costCenterName}</span>
      </button>

      {open && (
        <div className="flex gap-x-4">
          <div className="w-[1px] h-full bg-primary-primary ml-3" />
          <nav>
            <ul className="flex flex-col gap-y-3 justify-between">
              {internalRoutes.map(route => (
                <li className="leading-none" key={route.path}>
                  <NavLink
                    to={route.path}
                    className={clsx(
                      'inline-flex items-center text-grey-800 font-semibold gap-x-1 hover:text-secondary',
                      {
                        'text-secondary':
                          isActive && location.pathname.includes(route.key),
                      }
                    )}
                  >
                    {route.icon}
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
