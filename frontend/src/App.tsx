import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CreateUser from "./pages/CreateUser";
import Contacts from "./pages/Contacts";
import Products from "./pages/Products";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import Journals from "./pages/Journals";
import JournalEntries from "./pages/JournalEntries";
import AnalyticAccounts from "./pages/AnalyticAccounts";
import Budgets from "./pages/Budgets";
import PurchaseOrders from "./pages/PurchaseOrders";
import VendorBills from "./pages/VendorBills";
import DemoJournalEntry from "./pages/DemoJournalEntry";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Welcome / Entry Experience */}
          <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />

        {/* Public Authentication Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected Application Routes */}
        <Route
          path="/users/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateUser />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Contacts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chart-of-accounts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChartOfAccounts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/journals"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Journals />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/journal-entries"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <JournalEntries />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Budgets />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytic-accounts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AnalyticAccounts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PurchaseOrders />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor-bills"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <VendorBills />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/demo-journal-entry"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DemoJournalEntry />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Sales Routes */}
        <Route
          path="/sales-orders"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Sales />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-invoices"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Sales />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Sales />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Financial Report Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/balance-sheet"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/profit-and-loss"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/budget-report"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/trial-balance"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
