import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ drawerWidth = 240 }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalanceIcon sx={{ color: "#e91e8c", display: { sm: "none" } }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#ffffff" }}>
            {import.meta.env.VITE_BANK_NAME || "Medha Bank"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" sx={{ color: "#ffb3d9", fontWeight: 600 }}>
              {userProfile?.name || userProfile?.email}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
              {userProfile?.role === "admin" ? "Administrator" : "Customer"}
            </Typography>
          </Box>
          <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
            <Avatar
              sx={{
                background: "linear-gradient(135deg, #e91e8c, #b0006a)",
                width: 40,
                height: 40,
                fontWeight: 700,
                cursor: "pointer",
                border: "2px solid rgba(233,30,140,0.4)",
              }}
            >
              {getInitials(userProfile?.name || userProfile?.email)}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #1a1a2e, #2d0a2e)",
              border: "1px solid rgba(233,30,140,0.3)",
              mt: 1,
            },
          }}
        >
          <MenuItem disabled>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {userProfile?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                {userProfile?.email}
              </Typography>
            </Box>
          </MenuItem>
          <Divider sx={{ borderColor: "rgba(233,30,140,0.2)" }} />
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate(userProfile?.role === "admin" ? "/admin" : "/customer/profile");
            }}
          >
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: "#f44336" }}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
