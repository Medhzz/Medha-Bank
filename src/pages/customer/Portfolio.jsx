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
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { privateDb } from "../../firebase/privateApp";
import { useAuth } from "../../context/AuthContext";

const Portfolio = () => {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userProfile?.uid) return;
      setLoading(true);
      try {
        const snap = await getDocs(
          query(
            collection(privateDb, "transactions"),
            where("userId", "==", userProfile.uid)
          )
        );
        const txns = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        txns.sort((a, b) => {
          const aTime = a.timestamp?.toDate?.()?.getTime() || 0;
          const bTime = b.timestamp?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        setTransactions(txns);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [userProfile]);

  const filtered = transactions.filter((t) => {
    const matchesFilter = filter === "all" || t.type === filter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.fromAccount?.includes(search) ||
      t.toAccount?.includes(search) ||
      t.remarks?.toLowerCase().includes(searchLower) ||
      t.toBank?.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

const isCredit = (t) => t.type === "credit" || (t.type !== "debit" && t.toAccount === userProfile?.accountNumber);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Portfolio</Typography>
      <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
        Your complete transaction history.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, maxWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "rgba(255,255,255,0.4)" }} />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" spacing={1}>
          {["all", "transfer", "loan", "deposit"].map((f) => (
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
                    {["Date", "Type", "From / To", "Amount", "Bank", "Remarks", "Status"].map((h) => (
                      <TableCell key={h} sx={{ color: "#e91e8c", fontWeight: 700, borderBottom: "1px solid rgba(233,30,140,0.3)" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "rgba(255,255,255,0.5)" }}>
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => {
                      const credit = isCredit(t);
                      return (
                        <TableRow key={t.id} hover sx={{ "&:hover": { background: "rgba(233,30,140,0.05)" } }}>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {t.timestamp?.toDate?.()?.toLocaleString() || "—"}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <Chip
                              label={t.type || "transfer"}
                              size="small"
                              sx={{ background: "rgba(233,30,140,0.15)", color: "#e91e8c", border: "1px solid rgba(233,30,140,0.3)", textTransform: "capitalize" }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {credit ? t.fromAccount : t.toAccount}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              {credit
                                ? <ArrowDownwardIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                                : <ArrowUpwardIcon sx={{ color: "#f44336", fontSize: 16 }} />
                              }
                              <Typography sx={{ color: credit ? "#4caf50" : "#f44336", fontWeight: 700 }}>
                                ₹{t.amount?.toLocaleString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontFamily: "monospace", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {credit ? t.fromBank : t.toBank}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {t.remarks || "—"}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <Chip
                              label={t.status || "completed"}
                              size="small"
                              sx={{
                                background: t.status === "completed" ? "rgba(76,175,80,0.2)" : "rgba(255,152,0,0.2)",
                                color: t.status === "completed" ? "#4caf50" : "#ff9800",
                                border: `1px solid ${t.status === "completed" ? "rgba(76,175,80,0.4)" : "rgba(255,152,0,0.4)"}`,
                                textTransform: "capitalize",
                              }}
                            />
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
    </Box>
  );
};

export default Portfolio;
