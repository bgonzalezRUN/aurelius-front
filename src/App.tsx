import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequisitionsPage from './pages/RequisitionsPage';
import { RecoveryLink } from './pages/RecoveryLink';
import RecoveryPassword from './pages/RecoveryPassword';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmationPopup } from './components/common';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { paths } from './paths';
import UserAuth from './pages/UserAuth';
import CostCenter from './pages/CostCenter';
import CostCenterManage from './pages/costCenter/CostCenterManage';
import LayoutWithoutSidebar from './components/LayoutWithoutSidebar';
import Unauthorized from './components/common/Unauthorized';
import Welcome from './components/common/Welcome';
import NotFound from './components/common/NotFound';

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path={paths.LOGIN} element={<UserAuth />} />
          <Route path={paths.REGISTER} element={<UserAuth />} />
          <Route path={paths.RECOVER_PASSWORD} element={<RecoveryLink />} />
          <Route path={paths.NEW_PASSWORD} element={<RecoveryPassword />} />
          <Route path={paths.UNAUTHORIZED} element={<Unauthorized />} />

          <Route element={<ProtectedRoute onlyAdmin={false}/>}>
            <Route path={paths.BASE} element={<Layout />}>
             <Route index element={<Welcome />} />
              <Route  path={`:id${paths.REQUISITIONS}`} element={<RequisitionsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute onlyAdmin/>}>
            <Route path={paths.ADMIN} element={<Layout />}>
            <Route  path={`:id${paths.REQUISITIONS}`} element={<RequisitionsPage />} />
              <Route path={paths.CC} element={<LayoutWithoutSidebar />}>
                <Route index element={<CostCenter />} />
                <Route
                  path={`:id/${paths.MANAGE}`}
                  element={<CostCenterManage />}
                />
              </Route>
            </Route>
          </Route>
           <Route path="*" element={<NotFound/>} />
        </Routes>
        <ConfirmationPopup />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
