import { UserStar } from 'lucide-react';
import { H1 } from '../../components/common/Text';
import { useCostCenterById } from '../../api/queries/costCenterQuery';
import { useParams } from 'react-router-dom';
import About from '../../components/costCenter/About';
import { useCallback, useState } from 'react';
import Team from '../../components/costCenter/Team';
import Tabs from '../../components/common/Tabs';

export default function CostCenterManage() {
  const { costCenterId } = useParams();
  const { data } = useCostCenterById(costCenterId || '');
  const [option, setOption] = useState<'about' | 'team'>('about');

  const handleTabSelect = useCallback((id: 'about' | 'team') => {
    setOption(id);
  }, []);

 const TABS_CONFIG = [
  {
    id: 'about',
    name: 'Información General',    
    onClick: () =>handleTabSelect('about'), 
  },
  {
    id: 'team',
    name: 'Equipo',
    onClick: () =>handleTabSelect('team'),
  },
  
];

  const renderContent = () => {
    switch (option) {
      case 'about':
        return <About id={costCenterId || ''} />;
      case 'team':
        return <Team  id={costCenterId || ''}/>;
      default:
        return null;
    }
  };

  if (!data) return null;

  return (
    <div className="flex flex-col h-full max-h-screen gap-y-5">
      <div className="flex justify-between items-center">
        <div>
          <H1>
            <UserStar size={28} />
            Administrar
          </H1>
          <p className="text-grey-primary text-sm font-semibold">
            {data.costCenterName}
          </p>
        </div>
        <H1>{data?.costCenterCode}</H1>
      </div>
      <Tabs
        tabs={TABS_CONFIG}
        activeTabId={option}        
      />

      {renderContent()}
    </div>
  );
}
