import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card
    sx={{
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      border: `1px solid ${color}33`,
      borderRadius: 3,
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-4px)" },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 1 }}>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={28} sx={{ color }} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 800, color }}>
              {value}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            background: `${color}22`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, loans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(query(collection(privateDb, "users"), where("role", "==", "customer")));
        const allUsers = usersSnap.docs.map((d) => d.data());
        const pendingCount = allUsers.filter((u) => u.status === "pending").length;
        const activeCount = allUsers.filter((u) => u.status === "approved").length;
        const loansSnap = await getDocs(collection(privateDb, "loans"));
        setStats({
          total: allUsers.length,
          pending: pendingCount,
          active: activeCount,
          loans: loansSnap.docs.length,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Customers", value: stats.total, icon: <PeopleIcon fontSize="large" />, color: "#e91e8c" },
    { title: "Pending Requests", value: stats.pending, icon: <HourglassTopIcon fontSize="large" />, color: "#ff9800" },
    { title: "Active Accounts", value: stats.active, icon: <CheckCircleIcon fontSize="large" />, color: "#4caf50" },
    { title: "Total Loans", value: stats.loans, icon: <CreditScoreIcon fontSize="large" />, color: "#2196f3" },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}>
        Welcome back! Here's an overview of Medha Bank.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.2)", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: "Review Pending Applications", desc: "Check and approve new customer accounts", href: "/admin/requests" },
              { label: "Manage Loan Requests", desc: "Approve or reject pending loan applications", href: "/admin/loans" },
              { label: "Set Transfer Limits", desc: "Configure per-customer transfer limits", href: "/admin/limits" },
              { label: "Bank Management", desc: "View connected banks and configurations", href: "/admin/bank" },
            ].map((action) => (
              <Grid item xs={12} sm={6} key={action.label}>
                <Box
                  component="a"
                  href={action.href}
                  sx={{
                    display: "block",
                    p: 2,
                    borderRadius: 2,
                    background: "rgba(233,30,140,0.08)",
                    border: "1px solid rgba(233,30,140,0.2)",
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      background: "rgba(233,30,140,0.15)",
                      borderColor: "#e91e8c",
                    },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: "#e91e8c", fontWeight: 700 }}>
                    {action.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    {action.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
