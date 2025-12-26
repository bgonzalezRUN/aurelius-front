import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { paths } from './paths';
import { ConfirmationPopup, Loading } from './components/common';
import LayoutWithoutSidebar from './components/LayoutWithoutSidebar';
import Unauthorized from './components/common/Unauthorized';
import Welcome from './components/common/Welcome';
import NotFound from './components/common/NotFound';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { queryClient } from './api/queryClient';


const RequisitionsPage = lazy(() => import('./pages/RequisitionsPage'));
const RecoveryLink = lazy(() => import('./pages/RecoveryLink'));
const RecoveryPassword = lazy(() => import('./pages/RecoveryPassword'));
const UserAuth = lazy(() => import('./pages/UserAuth'));
const CostCenter = lazy(() => import('./pages/CostCenter'));
const CostCenterManage = lazy(
  () => import('./pages/costCenter/CostCenterManage')
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path={paths.LOGIN} element={<UserAuth />} />
            <Route path={paths.REGISTER} element={<UserAuth />} />
            <Route path={paths.RECOVER_PASSWORD} element={<RecoveryLink />} />
            <Route path={paths.NEW_PASSWORD} element={<RecoveryPassword />} />
            <Route path={paths.UNAUTHORIZED} element={<Unauthorized />} />

            <Route element={<ProtectedRoute onlyAdmin={false} />}>
              <Route path={paths.BASE} element={<Layout />}>
                <Route index element={<Welcome />} />
                <Route
                  path={`:costCenterId${paths.REQUISITIONS}`}
                  element={<RequisitionsPage />}
                />
              </Route>
            </Route>

            <Route element={<ProtectedRoute onlyAdmin />}>
              <Route path={paths.ADMIN} element={<Layout />}>
                <Route
                  path={`:costCenterId${paths.REQUISITIONS}`}
                  element={<RequisitionsPage />}
                />
                <Route path={paths.CC} element={<LayoutWithoutSidebar />}>
                  <Route index element={<CostCenter />} />
                  <Route
                    path={`:costCenterId/${paths.MANAGE}`}
                    element={<CostCenterManage />}
                  />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ConfirmationPopup />
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            className: 'Nunito Sans',
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
