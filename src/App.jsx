import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, Toolbar } from "@mui/material";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar, { DRAWER_WIDTH } from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerRequests from "./pages/admin/CustomerRequests";
import LoanApprovals from "./pages/admin/LoanApprovals";
import BankManagement from "./pages/admin/BankManagement";
import TransferLimits from "./pages/admin/TransferLimits";
import AuditLog from "./pages/admin/AuditLog";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Transfer from "./pages/customer/Transfer";
import Portfolio from "./pages/customer/Portfolio";
import Loans from "./pages/customer/Loans";
import Profile from "./pages/customer/Profile";
import "./styles/global.css";

const AppShell = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser } = useAuth();

  if (!currentUser) return children;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar drawerWidth={DRAWER_WIDTH} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
  component="main"
  sx={{
    flexGrow: 1,
    p: 3,
    ml: { sm: `${DRAWER_WIDTH}px` },
    width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #2d0a2e 100%)",
  }}
>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

function App() {
  const base = "";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter basename={base}>
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/requests" element={<ProtectedRoute requiredRole="admin"><CustomerRequests /></ProtectedRoute>} />
              <Route path="/admin/loans" element={<ProtectedRoute requiredRole="admin"><LoanApprovals /></ProtectedRoute>} />
              <Route path="/admin/bank" element={<ProtectedRoute requiredRole="admin"><BankManagement /></ProtectedRoute>} />
              <Route path="/admin/limits" element={<ProtectedRoute requiredRole="admin"><TransferLimits /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute requiredRole="admin"><AuditLog /></ProtectedRoute>} />

              <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/customer/transfer" element={<ProtectedRoute requiredRole="customer"><Transfer /></ProtectedRoute>} />
              <Route path="/customer/portfolio" element={<ProtectedRoute requiredRole="customer"><Portfolio /></ProtectedRoute>} />
              <Route path="/customer/loans" element={<ProtectedRoute requiredRole="customer"><Loans /></ProtectedRoute>} />
              <Route path="/customer/profile" element={<ProtectedRoute requiredRole="customer"><Profile /></ProtectedRoute>} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
      <ToastContainer position="top-right" theme="dark" />
    </ThemeProvider>
  );
}

export default App;
