import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { RoleRoute } from "./components/auth/RoleRoute";
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
import MyInvoices from "./pages/MyInvoices";
import Unauthorized from "./pages/Unauthorized";

// Role shorthand constants
const ADMIN_ONLY = ["ADMIN"] as const;
const ACCOUNTING_ROLES = ["ADMIN", "ACCOUNTANT"] as const;
const ALL_ROLES = ["ADMIN", "ACCOUNTANT", "USER"] as const;

function FallbackRoute() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "USER") return <Navigate to="/my-invoices" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Welcome / Entry Experience */}
          <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />

        {/* Public Authentication Routes */}
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/signup"          element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<ProtectedRoute><Unauthorized /></ProtectedRoute>} />

        {/* ── Dashboard (ADMIN and ACCOUNTANT only) ────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><Dashboard /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── USER-only: My Invoices ──────────────────────────────────────── */}
        <Route
          path="/my-invoices"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ALL_ROLES]}>
                <DashboardLayout><MyInvoices /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── ADMIN only: User Management ─────────────────────────────────── */}
        <Route
          path="/users/create"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ADMIN_ONLY]}>
                <DashboardLayout><CreateUser /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── ADMIN + ACCOUNTANT: Master Data ─────────────────────────────── */}
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><Contacts /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><Products /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chart-of-accounts"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><ChartOfAccounts /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/journals"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><Journals /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── ADMIN + ACCOUNTANT: Accounting Transactions ─────────────────── */}
        <Route
          path="/journal-entries"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><JournalEntries /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><Budgets /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytic-accounts"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><AnalyticAccounts /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><PurchaseOrders /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor-bills"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><VendorBills /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/demo-journal-entry"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout><DemoJournalEntry /></DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Sales Routes */}
        <Route
          path="/sales-orders"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ALL_ROLES]}>
                <DashboardLayout>
                  <Sales />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-invoices"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ALL_ROLES]}>
                <DashboardLayout>
                  <Sales />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipts"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ALL_ROLES]}>
                <DashboardLayout>
                  <Sales />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Financial Report Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/balance-sheet"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/profit-and-loss"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/budget-report"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/trial-balance"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...ACCOUNTING_ROLES]}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
