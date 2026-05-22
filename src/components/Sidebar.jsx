import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import HistoryIcon from "@mui/icons-material/History";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import TuneIcon from "@mui/icons-material/Tune";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 240;

const adminNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
  { label: "Customer Requests", icon: <PeopleIcon />, path: "/admin/requests" },
  { label: "Loan Approvals", icon: <CreditScoreIcon />, path: "/admin/loans" },
  { label: "Bank Management", icon: <BusinessIcon />, path: "/admin/bank" },
  { label: "Transfer Limits", icon: <TuneIcon />, path: "/admin/limits" },
  { label: "Audit Log", icon: <AssignmentIcon />, path: "/admin/audit" },
];

const customerNavItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/customer" },
  { label: "Transfer Money", icon: <SwapHorizIcon />, path: "/customer/transfer" },
  { label: "Portfolio", icon: <HistoryIcon />, path: "/customer/portfolio" },
  { label: "Loans", icon: <CreditScoreIcon />, path: "/customer/loans" },
  { label: "Profile", icon: <PersonIcon />, path: "/customer/profile" },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = userProfile?.role === "admin";
  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const handleNavClick = (path) => {
    navigate(path);
    onClose && onClose();
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid rgba(233,30,140,0.2)",
        }}
      >
        <Avatar
          sx={{
            background: "linear-gradient(135deg, #e91e8c, #b0006a)",
            width: 40,
            height: 40,
          }}
        >
          <AccountBalanceIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {import.meta.env.VITE_BANK_NAME || "Medha Bank"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#e91e8c", fontWeight: 600 }}>
            {isAdmin ? "Admin Panel" : "Customer Portal"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <List disablePadding>
          {navItems.map((item) => {
            const isSelected =
              item.path === "/admin" || item.path === "/customer"
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
            return (
              <ListItemButton
                key={item.path}
                selected={isSelected}
                onClick={() => handleNavClick(item.path)}
                sx={{ mx: 1, my: 0.5, borderRadius: 2 }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? "#e91e8c" : "rgba(255,255,255,0.6)",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? "#ffffff" : "rgba(255,255,255,0.7)",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: "rgba(233,30,140,0.2)" }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
          IFSC: {import.meta.env.VITE_IFSC_CODE}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
