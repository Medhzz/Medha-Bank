import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";

const Profile = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [form, setForm] = useState({
    name: userProfile?.name || "",
    phone: userProfile?.phone || "",
    address: userProfile?.address || "",
  });

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setSnackbar({ open: true, message: "Name and phone are required.", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(privateDb, "users", userProfile.uid), {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      await refreshProfile();
      setEditing(false);
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>My Profile</Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        View and update your personal information.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.2)", borderRadius: 3, textAlign: "center" }}>
            <CardContent sx={{ p: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background: "linear-gradient(135deg,#e91e8c,#b0006a)",
                  fontSize: 36,
                  fontWeight: 700,
                  mx: "auto",
                  mb: 2,
                  border: "3px solid rgba(233,30,140,0.4)",
                }}
              >
                {getInitials(userProfile?.name)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {userProfile?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}>
                {userProfile?.email}
              </Typography>
              <StatusBadge status={userProfile?.status} />
              <Divider sx={{ my: 2, borderColor: "rgba(233,30,140,0.2)" }} />
              <Box sx={{ textAlign: "left" }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Account Number</Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, color: "#e91e8c" }}>
                    {userProfile?.accountNumber}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Balance</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#4caf50" }}>
                    ₹{(userProfile?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>Transfer Limit</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#ff9800" }}>
                    ₹{(userProfile?.transferLimit || 10000).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.2)", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Information</Typography>
                {!editing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                    sx={{ borderColor: "#e91e8c", color: "#e91e8c" }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button onClick={() => setEditing(false)} sx={{ color: "rgba(255,255,255,0.6)" }}>Cancel</Button>
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                      variant="contained"
                      sx={{ background: "linear-gradient(135deg,#e91e8c,#b0006a)" }}
                    >
                      {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Save"}
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    value={editing ? form.name : userProfile?.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address"
                    value={userProfile?.email || ""}
                    fullWidth
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    value={editing ? form.phone : userProfile?.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Aadhar Number"
                    value={userProfile?.aadhar || ""}
                    fullWidth
                    disabled
                    helperText="Cannot be changed after registration"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="PAN Number"
                    value={userProfile?.pan || ""}
                    fullWidth
                    disabled
                    helperText="Cannot be changed after registration"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    value={editing ? form.address : userProfile?.address || ""}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    fullWidth
                    disabled={!editing}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
