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
  Chip,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";

const ACTION_META = {
  approved: { color: "#4caf50", icon: <CheckCircleIcon fontSize="small" /> },
  rejected: { color: "#f44336", icon: <CancelIcon fontSize="small" /> },
  hold: { color: "#ff9800", icon: <PauseCircleIcon fontSize="small" /> },
  loan_approved: { color: "#4caf50", icon: <AccountBalanceWalletIcon fontSize="small" /> },
  loan_rejected: { color: "#f44336", icon: <AccountBalanceWalletIcon fontSize="small" /> },
};

const TYPE_LABELS = {
  account: "Account",
  loan: "Loan",
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(privateDb, "auditLogs"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Audit log fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter((log) => {
    const matchType = filterType === "all" || log.type === filterType;
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      log.customerName?.toLowerCase().includes(term) ||
      log.customerEmail?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      log.remarks?.toLowerCase().includes(term);
    return matchType && matchSearch;
  });

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const getActionLabel = (action) => {
    if (action === "loan_approved") return "Loan Approved";
    if (action === "loan_rejected") return "Loan Rejected";
    return action ? action.charAt(0).toUpperCase() + action.slice(1) : "—";
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Audit Log</Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        Full record of every admin decision — account approvals, rejections, holds, and loan actions.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1}>
          {["all", "account", "loan"].map((t) => (
            <Chip
              key={t}
              label={t === "all" ? "All" : TYPE_LABELS[t]}
              onClick={() => setFilterType(t)}
              sx={{
                background: filterType === t ? "rgba(233,30,140,0.3)" : "rgba(255,255,255,0.05)",
                border: filterType === t ? "1px solid #e91e8c" : "1px solid rgba(255,255,255,0.1)",
                color: "white",
                cursor: "pointer",
                fontWeight: filterType === t ? 700 : 400,
              }}
            />
          ))}
        </Stack>
        <TextField
          size="small"
          placeholder="Search by customer, action, remarks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
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
                    {["Timestamp", "Type", "Customer", "Email", "Action", "Remarks", "Detail"].map((h) => (
                      <TableCell key={h} sx={{ color: "#e91e8c", fontWeight: 700, borderBottom: "1px solid rgba(233,30,140,0.3)", whiteSpace: "nowrap" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: "rgba(255,255,255,0.4)" }}>
                        {logs.length === 0 ? "No audit entries yet. Actions on Customer Requests and Loans will appear here." : "No entries match your search."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((log) => {
                      const meta = ACTION_META[log.action] || {};
                      return (
                        <TableRow key={log.id} hover sx={{ "&:hover": { background: "rgba(233,30,140,0.04)" } }}>
                          <TableCell sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                            {formatDate(log.timestamp)}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <Chip
                              size="small"
                              label={TYPE_LABELS[log.type] || log.type}
                              sx={{
                                background: log.type === "account" ? "rgba(33,150,243,0.2)" : "rgba(156,39,176,0.2)",
                                color: log.type === "account" ? "#64b5f6" : "#ce93d8",
                                fontWeight: 600,
                                fontSize: "0.72rem",
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {log.customerName || "—"}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {log.customerEmail || "—"}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: meta.color || "white" }}>
                              {meta.icon}
                              <Typography variant="body2" sx={{ fontWeight: 700, color: meta.color || "white" }}>
                                {getActionLabel(log.action)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", borderBottom: "1px solid rgba(255,255,255,0.05)", maxWidth: 200 }}>
                            {log.remarks || <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {log.detail || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {!loading && filtered.length > 0 && (
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", mt: 1, display: "block", textAlign: "right" }}>
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </Typography>
      )}
    </Box>
  );
};

export default AuditLog;
