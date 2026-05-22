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
  Divider,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useState } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";
import { hubDb } from "../../firebase/hubApp";
import { useAuth } from "../../context/AuthContext";

const Transfer = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    recipientAccount: "",
    ifscCode: "",
    amount: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [error, setError] = useState("");

  const isApproved = userProfile?.status === "approved";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");

    const amount = Number(form.amount);
    if (!amount || amount <= 0) return setError("Please enter a valid amount.");
    if (amount > (userProfile?.balance || 0)) return setError("Insufficient balance.");
    if (amount > (userProfile?.transferLimit || 10000)) {
      return setError(`Amount exceeds your transfer limit of ₹${(userProfile?.transferLimit || 10000).toLocaleString()}.`);
    }

    setLoading(true);
    try {
      const isSameBank = form.ifscCode.toUpperCase() === import.meta.env.VITE_IFSC_CODE;

      if (isSameBank) {
        const recipientSnap = await getDocs(
          query(collection(privateDb, "users"), where("accountNumber", "==", form.recipientAccount))
        );
        if (recipientSnap.empty) {
          setLoading(false);
          return setError("Recipient account not found in Medha Bank.");
        }
        const recipientDoc = recipientSnap.docs[0];
        const recipientData = recipientDoc.data();

        const newSenderBalance = (userProfile.balance || 0) - amount;
        const newRecipientBalance = (recipientData.balance || 0) + amount;

        await updateDoc(doc(privateDb, "users", userProfile.uid), { balance: newSenderBalance });
        await updateDoc(doc(privateDb, "users", recipientDoc.id), { balance: newRecipientBalance });

    // Debit record for sender
        await addDoc(collection(privateDb, "transactions"), {
          fromAccount: userProfile.accountNumber,
          toAccount: form.recipientAccount,
          fromBank: import.meta.env.VITE_IFSC_CODE,
          toBank: form.ifscCode.toUpperCase(),
          amount,
          type: "debit",
          remarks: form.remarks || "Transfer sent",
          timestamp: serverTimestamp(),
          status: "completed",
          userId: userProfile.uid,
        });
        // Credit record for recipient
        await addDoc(collection(privateDb, "transactions"), {
          fromAccount: userProfile.accountNumber,
          toAccount: form.recipientAccount,
          fromBank: import.meta.env.VITE_IFSC_CODE,
          toBank: form.ifscCode.toUpperCase(),
          amount,
          type: "credit",
          remarks: form.remarks || "Transfer received",
          timestamp: serverTimestamp(),
          status: "completed",
          userId: recipientDoc.id,
        });
      } else {
        await addDoc(collection(hubDb, "transfers"), {
          fromBank: import.meta.env.VITE_IFSC_CODE,
          fromAccount: userProfile.accountNumber,
          toBank: form.ifscCode.toUpperCase(),
          toAccount: form.recipientAccount,
          amount,
          timestamp: serverTimestamp(),
          status: "pending",
          remarks: form.remarks,
        });

        await updateDoc(doc(privateDb, "users", userProfile.uid), {
          balance: (userProfile.balance || 0) - amount,
        });

        await addDoc(collection(privateDb, "transactions"), {
          fromAccount: userProfile.accountNumber,
          toAccount: form.recipientAccount,
          fromBank: import.meta.env.VITE_IFSC_CODE,
          toBank: form.ifscCode.toUpperCase(),
          amount,
          type: "transfer",
          remarks: form.remarks,
          timestamp: serverTimestamp(),
          status: "pending",
          userId: userProfile.uid,
        });
      }

      await refreshProfile();
      setSnackbar({
        open: true,
        message: `₹${amount.toLocaleString()} transferred successfully${isSameBank ? "" : " (inter-bank, pending settlement)"}.`,
        severity: "success",
      });
      setForm({ recipientAccount: "", ifscCode: "", amount: "", remarks: "" });
    } catch (err) {
      setSnackbar({ open: true, message: `Transfer failed: ${err.message}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Transfer Money</Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        Send money instantly within Medha Bank or to other banks.
      </Typography>

      {!isApproved && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Transfers are only available for approved accounts.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.2)", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <SwapHorizIcon sx={{ color: "#e91e8c" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Transfer Details</Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <Box component="form" onSubmit={handleTransfer} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Recipient Account Number"
                  name="recipientAccount"
                  value={form.recipientAccount}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={!isApproved}
                  inputProps={{ maxLength: 20 }}
                />
                <TextField
                  label="IFSC Code"
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={!isApproved}
                  placeholder={`${import.meta.env.VITE_IFSC_CODE} for same bank`}
                  helperText={
                    form.ifscCode.toUpperCase() === import.meta.env.VITE_IFSC_CODE
                      ? "Same bank transfer — instant"
                      : form.ifscCode
                      ? "Inter-bank transfer — may take time"
                      : ""
                  }
                />
                <TextField
                  label="Amount (INR)"
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={!isApproved}
                  inputProps={{ min: 1, max: userProfile?.transferLimit || 10000 }}
                />
                <TextField
                  label="Remarks (optional)"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isApproved}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !isApproved}
                  sx={{
                    py: 1.5,
                    background: "linear-gradient(135deg,#e91e8c,#b0006a)",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Transfer Now"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.2)", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Your Account</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Available Balance</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#4caf50" }}>
                  ₹{(userProfile?.balance || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Transfer Limit</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#ff9800" }}>
                  ₹{(userProfile?.transferLimit || 10000).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>Account No.</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                  {userProfile?.accountNumber}
                </Typography>
              </Box>
              <Divider sx={{ my: 2, borderColor: "rgba(233,30,140,0.2)" }} />
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                Same bank IFSC: <strong>{import.meta.env.VITE_IFSC_CODE}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Transfer;
