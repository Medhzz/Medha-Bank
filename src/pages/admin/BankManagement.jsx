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
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { hubDb } from "../../firebase/hubApp";

const BankManagement = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const snap = await getDocs(collection(hubDb, "banks"));
        setBanks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        setError("Could not load bank data from Shared Hub. " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Bank Management</Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        View banks registered in the Shared Hub network.
      </Typography>

      <Card sx={{ background: "rgba(233,30,140,0.08)", border: "1px solid rgba(233,30,140,0.3)", borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AccountBalanceIcon sx={{ color: "#e91e8c", fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {import.meta.env.VITE_BANK_NAME}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                  Bank ID: <strong style={{ color: "#e91e8c" }}>{import.meta.env.VITE_BANK_ID}</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                  IFSC: <strong style={{ color: "#e91e8c" }}>{import.meta.env.VITE_IFSC_CODE}</strong>
                </Typography>
              </Box>
            </Box>
            <Chip label="Your Bank" sx={{ ml: "auto", background: "rgba(233,30,140,0.3)", color: "#e91e8c", border: "1px solid #e91e8c", fontWeight: 700 }} />
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Card sx={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(233,30,140,0.2)", borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(233,30,140,0.2)" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Shared Hub Banks</Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress sx={{ color: "#e91e8c" }} />
            </Box>
          ) : banks.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                No banks found in hub network. The hub may require authentication.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "rgba(233,30,140,0.1)" }}>
                    {["Bank Name", "Bank ID", "IFSC Code", "Status"].map((h) => (
                      <TableCell key={h} sx={{ color: "#e91e8c", fontWeight: 700, borderBottom: "1px solid rgba(233,30,140,0.3)" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banks.map((bank) => (
                    <TableRow key={bank.id} hover sx={{ "&:hover": { background: "rgba(233,30,140,0.05)" } }}>
                      <TableCell sx={{ color: "white", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{bank.name || bank.bankName}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{bank.bankId || bank.id}</TableCell>
                      <TableCell sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{bank.ifsc || bank.ifscCode}</TableCell>
                      <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <Chip label="Active" size="small" sx={{ background: "rgba(76,175,80,0.2)", color: "#4caf50", border: "1px solid rgba(76,175,80,0.4)", fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BankManagement;
