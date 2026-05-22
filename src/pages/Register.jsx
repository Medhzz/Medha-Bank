import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  CircularProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateAccountNumber } from "../utils/generateAccountNumber";

const steps = ["Personal Info", "Identity Docs", "Review"];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    aadhar: "",
    pan: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!form.name || !form.email || !form.password || !form.phone || !form.address) {
        setError("Please fill in all required fields.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }
    if (activeStep === 1) {
      if (!form.aadhar || !form.pan) {
        setError("Please provide Aadhar and PAN numbers.");
        return;
      }
      if (form.aadhar.length !== 12) {
        setError("Aadhar number must be 12 digits.");
        return;
      }
      if (form.pan.length !== 10) {
        setError("PAN number must be 10 characters.");
        return;
      }
    }
    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        aadhar: form.aadhar,
        pan: form.pan.toUpperCase(),
        accountNumber: generateAccountNumber(),
      });
      navigate("/customer");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d0a2e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        py: 4,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 560,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(233,30,140,0.3)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #e91e8c, #b0006a)",
                mb: 1.5,
              }}
            >
              <AccountBalanceIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Open an Account
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Join Medha Bank today
            </Typography>
          </Box>

          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 3,
              "& .MuiStepLabel-label": { color: "rgba(255,255,255,0.6)" },
              "& .MuiStepLabel-label.Mui-active": { color: "#e91e8c" },
              "& .MuiStepLabel-label.Mui-completed": { color: "#4caf50" },
              "& .MuiStepIcon-root": { color: "rgba(255,255,255,0.2)" },
              "& .MuiStepIcon-root.Mui-active": { color: "#e91e8c" },
              "& .MuiStepIcon-root.Mui-completed": { color: "#4caf50" },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth required multiline rows={2} />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: 2, mb: 1 }}>
                  Your initial deposit of <strong>INR 1,000</strong> will be credited upon account approval.
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Aadhar Number"
                  name="aadhar"
                  value={form.aadhar}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ maxLength: 12 }}
                  helperText="12-digit Aadhar number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="PAN Number"
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ maxLength: 10 }}
                  helperText="10-character PAN number (e.g., ABCDE1234F)"
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Box>
              <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                Please review your information before submitting.
              </Alert>
              {[
                ["Full Name", form.name],
                ["Email", form.email],
                ["Phone", form.phone],
                ["Address", form.address],
                ["Aadhar", form.aadhar],
                ["PAN", form.pan.toUpperCase()],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                </Box>
              ))}
              <Box sx={{ mt: 2, p: 2, background: "rgba(233,30,140,0.1)", borderRadius: 2, border: "1px solid rgba(233,30,140,0.3)" }}>
                <Typography variant="body2" sx={{ color: "#ffb3d9" }}>
                  Your account will be pending review. Initial deposit of INR 1,000 will be credited upon approval.
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
            {activeStep > 0 && (
              <Button
                onClick={() => setActiveStep((p) => p - 1)}
                variant="outlined"
                sx={{ borderColor: "rgba(233,30,140,0.4)", color: "#e91e8c" }}
              >
                Back
              </Button>
            )}
            {activeStep < 2 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                fullWidth={activeStep === 0}
                sx={{ background: "linear-gradient(135deg, #e91e8c, #b0006a)" }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                sx={{ background: "linear-gradient(135deg, #e91e8c, #b0006a)" }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Submit Application"}
              </Button>
            )}
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#e91e8c", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
