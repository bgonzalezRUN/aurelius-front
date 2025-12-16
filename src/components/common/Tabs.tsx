import type { FC } from 'react';
import clsx from 'clsx';

export interface TabConfig {
  name: string;
  onClick: () => void;
  id: string | number;
}

export interface TabsProps {
  tabs: TabConfig[];
  activeTabId: string | number;
  
}
const Tabs: FC<TabsProps> = ({ tabs, activeTabId }) => {
  const handleTabClick = (tab: TabConfig) => {
    tab.onClick();
  };

  return (
    <div className='flex'>
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={clsx(
              'mr-6 text-sm font-bold transition-colors duration-150',
              isActive
                ? 'text-secondary border-b-2 border-secondary '
                : 'text-grey-primary hover:text-primaryHover hover:border-grey-50 border-b-2 border-transparent'
            )}
            role="tab"
            aria-selected={isActive}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
