import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequisitionsPage from "./pages/RequisitionsPage";
import LoginPage from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reqs" element={<RequisitionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
