import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequisitionsPage from "./pages/RequisitionsPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/reqs" element={<RequisitionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
