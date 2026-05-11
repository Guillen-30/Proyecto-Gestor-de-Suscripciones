import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Subscriptions } from "./components/Subscriptions";
import { FinancialHistory } from "./components/FinancialHistory";
import { CredentialVault } from "./components/CredentialVault";
import { AccountSettings } from "./components/AccountSettings";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Categories } from "./components/Categories";
import { PaymentMethods } from "./components/PaymentMethods";

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "suscripciones", element: <Subscriptions /> },
      { path: "historial", element: <FinancialHistory /> },
      { path: "boveda", element: <CredentialVault /> },
      { path: "categorias", element: <Categories /> },
      { path: "metodos-pago", element: <PaymentMethods /> },
      { path: "configuracion", element: <AccountSettings /> },
    ],
  },
]);