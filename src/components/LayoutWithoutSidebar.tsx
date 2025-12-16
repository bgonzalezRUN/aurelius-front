import { Outlet } from 'react-router-dom';

const LayoutWithoutSidebar = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default LayoutWithoutSidebar;
