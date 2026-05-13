import { Navigate, Route, Routes } from "react-router-dom";
import { AuthenticatedShell } from "./components/AuthenticatedShell";
import { RequireAuth } from "./components/RequireAuth";
import { RequireFinancialProfile } from "./components/RequireFinancialProfile";
import { FinancialProfileOnboardingPage } from "./pages/FinancialProfileOnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { AddPayableAccountPage } from "./pages/AddPayableAccountPage";
import { EditPayableAccountPage } from "./pages/EditPayableAccountPage";
import { PayableAccountsPage } from "./pages/PayableAccountsPage";
import { DueSoonPayableAccountsPage } from "./pages/DueSoonPayableAccountsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { RegisterPage } from "./pages/RegisterPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/onboarding/financial-profile" element={<FinancialProfileOnboardingPage />} />
        <Route element={<RequireFinancialProfile />}>
          <Route element={<AuthenticatedShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/payable-accounts" element={<PayableAccountsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/accounts/due-soon" element={<DueSoonPayableAccountsPage />} />
            <Route path="/payable-accounts/new" element={<AddPayableAccountPage />} />
            <Route path="/payable-accounts/:payableAccountId/edit" element={<EditPayableAccountPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
