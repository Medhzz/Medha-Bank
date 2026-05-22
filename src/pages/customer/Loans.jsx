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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";

const Loans = () => {
  const { userProfile } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", purpose: "", tenure: "12" });

  const isApproved = userProfile?.status === "approved";

  const fetchLoans = async () => {
    if (!userProfile?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(privateDb, "loans"), where("userId", "==", userProfile.uid)));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.appliedAt?.toDate?.()?.getTime() || 0) - (a.appliedAt?.toDate?.()?.getTime() || 0));
      setLoans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return setError("Please enter a valid loan amount.");
    if (!form.purpose.trim()) return setError("Please describe the purpose of the loan.");

    setSubmitting(true);
    try {
      await addDoc(collection(privateDb, "loans"), {
        userId: userProfile.uid,
        userName: userProfile.name,
        userEmail: userProfile.email,
        accountNumber: userProfile.accountNumber,
        amount,
        purpose: form.purpose,
        tenure: Number(form.tenure),
        status: "pending",
        appliedAt: serverTimestamp(),
      });
      setSnackbar({ open: true, message: "Loan application submitted successfully!", severity: "success" });
      setForm({ amount: "", purpose: "", tenure: "12" });
      setShowForm(false);
      fetchLoans();
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Loan Management</Typography>
        {isApproved && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(!showForm)}
            sx={{ background: "linear-gradient(135deg,#e91e8c,#b0006a)", fontWeight: 700 }}
          >
            Apply for Loan
          </Button>
        )}
      </Box>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        Manage your loan applications.
      </Typography>

      {!isApproved && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Loans are only available for approved accounts.
        </Alert>
      )}

      {showForm && isApproved && (
        <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.3)", borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CreditScoreIcon sx={{ color: "#e91e8c" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>New Loan Application</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Loan Amount (INR)"
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    fullWidth
                    required
                    inputProps={{ min: 1000 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tenure (months)</InputLabel>
                    <Select
                      value={form.tenure}
                      label="Tenure (months)"
                      onChange={(e) => setForm({ ...form, tenure: e.target.value })}
                    >
                      {[6, 12, 24, 36, 48, 60].map((t) => (
                        <MenuItem key={t} value={String(t)}>{t} months</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, background: "rgba(233,30,140,0.08)", borderRadius: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Monthly EMI (approx.)</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#e91e8c" }}>
                      {form.amount && form.tenure
                        ? `₹${Math.ceil(Number(form.amount) / Number(form.tenure)).toLocaleString()}`
                        : "—"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Purpose of Loan"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={2}
                    placeholder="Describe the purpose of your loan request..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{ background: "linear-gradient(135deg,#e91e8c,#b0006a)", fontWeight: 700 }}
                    >
                      {submitting ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Submit Application"}
                    </Button>
                    <Button onClick={() => setShowForm(false)} sx={{ color: "rgba(255,255,255,0.6)" }}>Cancel</Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.2)", borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(233,30,140,0.2)" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>My Loan Applications</Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress sx={{ color: "#e91e8c" }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "rgba(233,30,140,0.1)" }}>
                    {["Amount", "Purpose", "Tenure", "Status", "Applied On"].map((h) => (
                      <TableCell key={h} sx={{ color: "#e91e8c", fontWeight: 700, borderBottom: "1px solid rgba(233,30,140,0.3)" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "rgba(255,255,255,0.5)" }}>
                        No loan applications yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans.map((loan) => (
                      <TableRow key={loan.id} hover sx={{ "&:hover": { background: "rgba(233,30,140,0.05)" } }}>
                        <TableCell sx={{ color: "#4caf50", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>₹{loan.amount?.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{loan.purpose}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{loan.tenure} months</TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}><StatusBadge status={loan.status} /></TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          {loan.appliedAt?.toDate?.()?.toLocaleDateString() || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Loans;
