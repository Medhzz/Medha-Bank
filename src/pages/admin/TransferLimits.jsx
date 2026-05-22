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
  Alert,
  Snackbar,
} from "@mui/material";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";

const TransferLimits = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, customer: null });
  const [newLimit, setNewLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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

  const openDialog = (customer) => {
    setDialog({ open: true, customer });
    setNewLimit(String(customer.transferLimit || 10000));
  };

  const handleSave = async () => {
    if (!newLimit || isNaN(Number(newLimit)) || Number(newLimit) <= 0) {
      setSnackbar({ open: true, message: "Please enter a valid limit amount.", severity: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await updateDoc(doc(privateDb, "users", dialog.customer.id), {
        transferLimit: Number(newLimit),
      });
      setSnackbar({ open: true, message: `Transfer limit updated to ₹${Number(newLimit).toLocaleString()}`, severity: "success" });
      fetchCustomers();
      setDialog({ open: false, customer: null });
    } catch (err) {
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Transfer Limits</Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        Set per-customer transaction limits.
      </Typography>

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
                    {["Customer Name", "Email", "Account No.", "Current Limit", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ color: "#e91e8c", fontWeight: 700, borderBottom: "1px solid rgba(233,30,140,0.3)" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "rgba(255,255,255,0.5)" }}>No customers found.</TableCell>
                    </TableRow>
                  ) : (
                    customers.map((c) => (
                      <TableRow key={c.id} hover sx={{ "&:hover": { background: "rgba(233,30,140,0.05)" } }}>
                        <TableCell sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{c.name}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{c.email}</TableCell>
                        <TableCell sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{c.accountNumber}</TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <Typography sx={{ color: "#4caf50", fontWeight: 700 }}>₹{(c.transferLimit || 10000).toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => openDialog(c)}
                            sx={{ background: "linear-gradient(135deg,#e91e8c,#b0006a)", color: "white", fontWeight: 600 }}
                          >
                            Edit Limit
                          </Button>
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

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, customer: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: "white" }}>Edit Transfer Limit</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
            Setting transfer limit for <strong>{dialog.customer?.name}</strong>
          </Typography>
          <TextField
            label="Transfer Limit (INR)"
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialog({ open: false, customer: null })} sx={{ color: "rgba(255,255,255,0.6)" }}>Cancel</Button>
          <Button onClick={handleSave} disabled={submitting} variant="contained" sx={{ background: "linear-gradient(135deg,#e91e8c,#b0006a)" }}>
            {submitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TransferLimits;
