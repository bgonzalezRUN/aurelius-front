import { useCostCenterById } from '../../api/queries/costCenterQuery';
import { File, FolderDot, FolderOpenDot, UserStar } from 'lucide-react';
import { paths } from '../../paths';
import clsx from 'clsx';
import { useLocation, NavLink } from 'react-router-dom';

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
  const location = useLocation();

  const internalRoutes = [
    {
      path: paths.REQUISITIONS,
      label: 'Requisiciones',
      icon: <File size={20} />,
    },
    {
      path: `${paths.CC}/${data?.costCenterId}/${paths.MANAGE}`,
      label: 'Administrar',
      icon: <UserStar size={20} />,
    },
  ];

  if (!data) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(Number(costCenterId))}
        className="flex items-center gap-x-2 text-secondary font-semibold line-clamp-2"
      >
        {isOpen ? (
          <FolderOpenDot className="flex-none" />
        ) : (
          <FolderDot className="flex-none" />
        )}
        <span className="text-start">{data.costCenterName}</span>
      </button>

      {isOpen && (
        <div className="flex gap-x-4">
          <div className="w-[1px] h-full bg-primary-primary ml-3" />
          <nav>
            <ul className="flex flex-col gap-y-3 justify-between">
              {internalRoutes.map(route => (
                <li className="leading-none">
                  <NavLink
                    to={route.path}
                    className={clsx(
                      'inline-flex items-center text-grey-800 font-semibold gap-x-1 hover:text-secondary',
                      {
                        'text-secondary': location.pathname.includes(
                          route.path
                        ),
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
