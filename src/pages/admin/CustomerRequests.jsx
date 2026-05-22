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
  TextField,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import { sendAccountStatusEmail } from "../../utils/sendEmail";

const CustomerRequests = () => {
  const { userProfile } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, customer: null, action: "" });
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [filter, setFilter] = useState("all");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(privateDb, "users"), where("role", "==", "customer")));
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openDialog = (customer, action) => setDialog({ open: true, customer, action });
  const closeDialog = () => { setDialog({ open: false, customer: null, action: "" }); setRemarks(""); };

  const handleAction = async () => {
    const { customer, action } = dialog;
    setSubmitting(true);
    try {
      await updateDoc(doc(privateDb, "users", customer.id), {
        status: action,
        updatedAt: serverTimestamp(),
        adminRemarks: remarks,
      });

      await addDoc(collection(privateDb, "auditLogs"), {
        type: "account",
        action,
        customerName: customer.name,
        customerEmail: customer.email,
        customerId: customer.id,
        remarks: remarks || "",
        detail: `Account No: ${customer.accountNumber || "N/A"}`,
        adminEmail: userProfile?.email || "admin",
        timestamp: serverTimestamp(),
      });

      await sendAccountStatusEmail(customer.email, customer.name, action, remarks);
      setSnackbar({ open: true, message: `Account ${action} successfully.`, severity: "success" });
      fetchCustomers();
      closeDialog();
    } catch (err) {
      setSnackbar({ open: true, message: `Failed to update account: ${err.message}`, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = filter === "all" ? customers : customers.filter((c) => c.status === filter);

  const actionColors = {
    approved: { bg: "linear-gradient(135deg,#4caf50,#388e3c)" },
    rejected: { bg: "linear-gradient(135deg,#f44336,#c62828)" },
    hold: { bg: "linear-gradient(135deg,#ff9800,#e65100)" },
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Customer Requests</Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        Review and manage customer account applications.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {["all", "pending", "approved", "rejected", "hold"].map((f) => (
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
                    {["Name", "Email", "Phone", "Account No.", "Status", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ color: "#e91e8c", fontWeight: 700, borderBottom: "1px solid rgba(233,30,140,0.3)" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: "rgba(255,255,255,0.5)" }}>
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} hover sx={{ "&:hover": { background: "rgba(233,30,140,0.05)" } }}>
                        <TableCell sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{customer.name}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{customer.email}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{customer.phone}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{customer.accountNumber}</TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <StatusBadge status={customer.status} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <Stack direction="row" spacing={1}>
                            {["approved", "hold", "rejected"].map((action) => (
                              customer.status !== action && (
                                <Button
                                  key={action}
                                  size="small"
                                  onClick={() => openDialog(customer, action)}
                                  sx={{
                                    background: actionColors[action].bg,
                                    color: "white",
                                    textTransform: "capitalize",
                                    fontWeight: 600,
                                    minWidth: "auto",
                                    px: 1.5,
                                    "&:hover": { opacity: 0.85 },
                                  }}
                                >
                                  {action === "hold" ? "Hold" : action.charAt(0).toUpperCase() + action.slice(1)}
                                </Button>
                              )
                            ))}
                          </Stack>
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

      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "white" }}>
          {dialog.action === "approved" ? "Approve" : dialog.action === "rejected" ? "Reject" : "Hold"} Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
            You are about to <strong style={{ color: "#e91e8c" }}>{dialog.action}</strong> the account for{" "}
            <strong>{dialog.customer?.name}</strong>. An email notification will be sent to the customer.
          </Typography>
          <TextField
            label="Admin Remarks (optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ color: "rgba(255,255,255,0.6)" }}>Cancel</Button>
          <Button
            onClick={handleAction}
            disabled={submitting}
            variant="contained"
            sx={{
              background:
                dialog.action === "approved"
                  ? "linear-gradient(135deg,#4caf50,#388e3c)"
                  : dialog.action === "rejected"
                  ? "linear-gradient(135deg,#f44336,#c62828)"
                  : "linear-gradient(135deg,#ff9800,#e65100)",
            }}
          >
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

export default CustomerRequests;
