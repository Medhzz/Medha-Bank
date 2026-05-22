import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";

const LoanApprovals = () => {
  const { userProfile } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, loan: null, action: "" });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [filter, setFilter] = useState("all");

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(privateDb, "loans"));
      setLoans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleAction = async () => {
    const { loan, action } = dialog;
    setSubmitting(true);
    try {
      await updateDoc(doc(privateDb, "loans", loan.id), {
        status: action,
        reviewedAt: serverTimestamp(),
      });

      if (action === "approved") {
        const userSnap = await getDocs(query(collection(privateDb, "users"), where("uid", "==", loan.userId)));
        if (!userSnap.empty) {
          const userDoc = userSnap.docs[0];
          const newBalance = (userDoc.data().balance || 0) + loan.amount;
          await updateDoc(doc(privateDb, "users", userDoc.id), { balance: newBalance });
        }
      }

      await addDoc(collection(privateDb, "auditLogs"), {
        type: "loan",
        action: action === "approved" ? "loan_approved" : "loan_rejected",
        customerName: loan.userName,
        customerEmail: loan.userEmail || "",
        customerId: loan.userId,
        remarks: "",
        detail: `₹${loan.amount?.toLocaleString()} — ${loan.purpose} (${loan.tenure} months)`,
        adminEmail: userProfile?.email || "admin",
        timestamp: serverTimestamp(),
      });

      setSnackbar({ open: true, message: `Loan ${action} successfully.`, severity: "success" });
      fetchLoans();
      setDialog({ open: false, loan: null, action: "" });
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLoans = filter === "all" ? loans : loans.filter((l) => l.status === filter);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Loan Approvals</Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        Review and manage customer loan applications.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {["all", "pending", "approved", "rejected"].map((f) => (
          <Chip
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            onClick={() => setFilter(f)}
            sx={{
              background: filter === f ? "rgba(233,30,140,0.3)" : "rgba(255,255,255,0.05)",
              border: filter === f ? "1px solid #e91e8c" : "1px solid rgba(255,255,255,0.1)",
              color: "white",
              cursor: "pointer",
              fontWeight: filter === f ? 700 : 400,
            }}
          />
        ))}
      </Stack>

      <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.2)", borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress sx={{ color: "#e91e8c" }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "rgba(233,30,140,0.1)" }}>
                    {["Customer", "Amount (INR)", "Purpose", "Tenure", "Status", "Applied", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ color: "#e91e8c", fontWeight: 700, borderBottom: "1px solid rgba(233,30,140,0.3)" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "rgba(255,255,255,0.5)" }}>No loans found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredLoans.map((loan) => (
                      <TableRow key={loan.id} hover sx={{ "&:hover": { background: "rgba(233,30,140,0.05)" } }}>
                        <TableCell sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{loan.userName}</TableCell>
                        <TableCell sx={{ color: "#4caf50", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>₹{loan.amount?.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{loan.purpose}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{loan.tenure} months</TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}><StatusBadge status={loan.status} /></TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          {loan.appliedAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          {loan.status === "pending" && (
                            <Stack direction="row" spacing={1}>
                              <Button size="small" onClick={() => setDialog({ open: true, loan, action: "approved" })} sx={{ background: "linear-gradient(135deg,#4caf50,#388e3c)", color: "white", fontWeight: 600 }}>
                                Approve
                              </Button>
                              <Button size="small" onClick={() => setDialog({ open: true, loan, action: "rejected" })} sx={{ background: "linear-gradient(135deg,#f44336,#c62828)", color: "white", fontWeight: 600 }}>
                                Reject
                              </Button>
                            </Stack>
                          )}
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

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, loan: null, action: "" })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: "white" }}>Confirm {dialog.action === "approved" ? "Approval" : "Rejection"}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Are you sure you want to <strong style={{ color: dialog.action === "approved" ? "#4caf50" : "#f44336" }}>{dialog.action}</strong> this loan of{" "}
            <strong>₹{dialog.loan?.amount?.toLocaleString()}</strong> for <strong>{dialog.loan?.userName}</strong>?
            {dialog.action === "approved" && " The amount will be credited to their account."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialog({ open: false, loan: null, action: "" })} sx={{ color: "rgba(255,255,255,0.6)" }}>Cancel</Button>
          <Button onClick={handleAction} disabled={submitting} variant="contained"
            sx={{ background: dialog.action === "approved" ? "linear-gradient(135deg,#4caf50,#388e3c)" : "linear-gradient(135deg,#f44336,#c62828)" }}>
            {submitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LoanApprovals;
