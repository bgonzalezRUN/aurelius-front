import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequisitionsPage from './pages/RequisitionsPage';
import LoginPage from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RecoveryLink } from './pages/RecoveryLink';
import RecoveryPassword from './pages/RecoveryPassword';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reqs" element={<RequisitionsPage />} />
          <Route path="/recovery-link" element={<RecoveryLink />} />
          <Route path="/recovery-password/:id" element={<RecoveryPassword />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
