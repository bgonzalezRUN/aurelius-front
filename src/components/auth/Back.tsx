import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftToLine } from 'lucide-react';
import { paths, pathsBase } from '../../paths';
import { useAuthStore } from '../../store/auth';
import { OptionButton } from '../common';

export default function Back() {
  const { getUser } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();
  const to = user?.isAdminCC ? pathsBase.ADMINCC : paths.BASE;
  const location = useLocation();

  if (
    location.pathname === pathsBase.ADMINCC ||
    location.pathname === paths.BASE
  )
    return null;

  return (
    <OptionButton buttonHandler={() => navigate(to)} title="Volver al inicio">
      <ArrowLeftToLine className="text-gray-500" />
    </OptionButton>
  );
}
