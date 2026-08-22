import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TimelineIcon from "@mui/icons-material/Timeline";

const STATUS_COLOR = {
  passed: "success",
  completed: "success",
  proceed: "success",
  blocked: "error",
  clarify: "warning",
  skipped: "default",
};

export default function ExecutionTracePanel({ traces = [] }) {
  if (!traces.length) return null;

  return (
    <Accordion
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "10px !important",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TimelineIcon fontSize="small" color="action" />
          <Typography variant="subtitle2">
            How your plan was prepared ({traces.length} steps)
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {traces.map((trace, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                py: 0.5,
                borderBottom: idx < traces.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Chip
                label={trace.status}
                size="small"
                color={STATUS_COLOR[trace.status] || "default"}
                variant="outlined"
                sx={{ minWidth: 80 }}
              />
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {trace.step}
                </Typography>
                {trace.detail && (
                  <Typography variant="caption" color="text.secondary">
                    {trace.detail}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
