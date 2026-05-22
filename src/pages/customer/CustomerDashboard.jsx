import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";

const CustomerDashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const isApproved = userProfile?.status === "approved";

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Welcome, {userProfile?.name?.split(" ")[0]}!
      </Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        Here's your account overview.
      </Typography>

      {!isApproved && (
        <Alert
          severity={userProfile?.status === "rejected" ? "error" : userProfile?.status === "hold" ? "warning" : "info"}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {userProfile?.status === "pending" && "Your account is pending admin approval. You'll be notified via email once reviewed."}
          {userProfile?.status === "hold" && "Your account is currently on hold. Please contact support."}
          {userProfile?.status === "rejected" && "Your account application was rejected. Please contact support."}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              background: "linear-gradient(135deg, rgba(233,30,140,0.15), rgba(176,0,106,0.1))",
              border: "1px solid rgba(233,30,140,0.4)",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Account Balance</Typography>
                <StatusBadge status={userProfile?.status || "pending"} />
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 800, color: "#ffffff", mb: 1 }}>
                ₹{(userProfile?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 3 }}>
                Available balance
              </Typography>
              <Divider sx={{ borderColor: "rgba(233,30,140,0.2)", mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Account Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace", color: "#e91e8c" }}>
                    {userProfile?.accountNumber || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>IFSC Code</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace", color: "#e91e8c" }}>
                    {import.meta.env.VITE_IFSC_CODE}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Transfer Limit</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#4caf50" }}>
                    ₹{(userProfile?.transferLimit || 10000).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Bank</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {import.meta.env.VITE_BANK_NAME}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Grid container spacing={2} sx={{ height: "100%" }}>
            {[
              {
                label: "Transfer Money",
                icon: <SwapHorizIcon sx={{ fontSize: 28 }} />,
                path: "/customer/transfer",
                color: "#e91e8c",
                desc: "Send to any bank",
              },
              {
                label: "Portfolio",
                icon: <HistoryIcon sx={{ fontSize: 28 }} />,
                path: "/customer/portfolio",
                color: "#2196f3",
                desc: "View all transactions",
              },
              {
                label: "Apply for Loan",
                icon: <CreditScoreIcon sx={{ fontSize: 28 }} />,
                path: "/customer/loans",
                color: "#4caf50",
                desc: "Quick loan approval",
              },
              {
                label: "My Profile",
                icon: <AccountBalanceWalletIcon sx={{ fontSize: 28 }} />,
                path: "/customer/profile",
                color: "#ff9800",
                desc: "Update your info",
              },
            ].map((item) => (
              <Grid item xs={6} key={item.label}>
                <Card
                  onClick={() => navigate(item.path)}
                  sx={{
                    background: `${item.color}14`,
                    border: `1px solid ${item.color}33`,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      background: `${item.color}25`,
                      borderColor: item.color,
                      transform: "translateY(-2px)",
                    },
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {isApproved && (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<SwapHorizIcon />}
            onClick={() => navigate("/customer/transfer")}
            sx={{ background: "linear-gradient(135deg,#e91e8c,#b0006a)", fontWeight: 700 }}
          >
            Transfer Money
          </Button>
          <Button
            variant="outlined"
            startIcon={<CreditScoreIcon />}
            onClick={() => navigate("/customer/loans")}
            sx={{ borderColor: "#e91e8c", color: "#e91e8c" }}
          >
            Apply for Loan
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CustomerDashboard;
