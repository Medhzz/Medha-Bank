import { Chip } from "@mui/material";

const statusConfig = {
  approved: { label: "Approved", color: "success" },
  pending: { label: "Pending", color: "warning" },
  rejected: { label: "Rejected", color: "error" },
  hold: { label: "On Hold", color: "warning" },
  active: { label: "Active", color: "success" },
  inactive: { label: "Inactive", color: "default" },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status?.toLowerCase()] || {
    label: status || "Unknown",
    color: "default",
  };

  const colorMap = {
    success: { bg: "rgba(76,175,80,0.2)", color: "#4caf50", border: "rgba(76,175,80,0.4)" },
    warning: { bg: "rgba(255,152,0,0.2)", color: "#ff9800", border: "rgba(255,152,0,0.4)" },
    error: { bg: "rgba(244,67,54,0.2)", color: "#f44336", border: "rgba(244,67,54,0.4)" },
    default: { bg: "rgba(255,255,255,0.1)", color: "#ffffff", border: "rgba(255,255,255,0.2)" },
  };

  const colors = colorMap[config.color] || colorMap.default;

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontWeight: 600,
        fontSize: "0.75rem",
      }}
    />
  );
};

export default StatusBadge;
