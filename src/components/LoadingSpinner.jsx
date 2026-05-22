import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #2d0a2e 100%)",
        gap: 2,
      }}
    >
      <CircularProgress
        size={60}
        sx={{
          color: "#e91e8c",
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }}
      />
      <Typography variant="body1" sx={{ color: "#ffb3d9" }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
