import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequisitionsPage from "./pages/RequisitionsPage";
import LoginPage from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RecoveryLink } from "./pages/RecoveryLink";
import RecoveryPassword from "./pages/RecoveryPassword";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reqs" element={<RequisitionsPage />} />
        <Route path="/recovery-link" element={<RecoveryLink />} />
        <Route path="/recovery-password/:id" element={<RecoveryPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
