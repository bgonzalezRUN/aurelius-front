import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-grow p-10 bg-grey-500 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
