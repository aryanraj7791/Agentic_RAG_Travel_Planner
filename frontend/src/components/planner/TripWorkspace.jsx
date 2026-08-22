import { Box, Paper, Typography } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import RecommendationsPanel from "../RecommendationsPanel";
import SourcesPanel from "../SourcesPanel";
import ExecutionTracePanel from "../ExecutionTracePanel";

export default function TripWorkspace({ response, loading }) {
  const hasWorkspaceData = Boolean(
    response?.recommendations?.length || response?.sources?.length || response?.execution_traces?.length,
  );

  return (
    <Box
      component="aside"
      aria-labelledby="workspace-heading"
      sx={{
        minWidth: 0,
        alignSelf: "start",
        position: { lg: "sticky" },
        top: { lg: 84 },
      }}
    >
      <Typography variant="overline" sx={{ color: "secondary.main" }}>
        Trip workspace
      </Typography>
      <Typography id="workspace-heading" variant="h4" component="h2" sx={{ mt: 0.25, mb: 0.75 }}>
        Trip details, kept together.
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Useful places, supporting sources, and planning steps stay alongside your itinerary.
      </Typography>

      {hasWorkspaceData ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <RecommendationsPanel recommendations={response.recommendations} />
          <SourcesPanel sources={response.sources} />
          <ExecutionTracePanel traces={response.execution_traces} />
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{ p: 2.25, bgcolor: "background.paper" }}
        >
          <AutoAwesomeOutlinedIcon sx={{ color: "secondary.main", mb: 1 }} />
          <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
            {loading ? "Preparing your trip workspace..." : "Your trip context will build here"}
          </Typography>
          <Typography variant="body2">
            {loading
              ? "Useful recommendations and supporting sources will appear when your response is ready."
              : "Ask a question to bring together useful recommendations and the sources behind them."}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
