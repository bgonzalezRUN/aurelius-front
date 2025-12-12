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

          <Route element={<ProtectedRoute />}>
            <Route path={paths.BASE} element={<Layout />}>
              <Route path={paths.REQUISITIONS} element={<RequisitionsPage />} />
            </Route>
          </Route>
        </Routes>
        <ConfirmationPopup />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
