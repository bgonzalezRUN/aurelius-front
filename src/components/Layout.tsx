import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
// import Back from './auth/Back';

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-grow px-10 pb-5 pt-6 bg-grey-500 overflow-y-auto h-full [&>*:first-child]:mb-3">
        {/* <Back /> */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
