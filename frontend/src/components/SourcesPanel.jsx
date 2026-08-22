import { Box, Link, Paper, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function SourcesPanel({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <Box component="section" aria-labelledby="sources-heading">
      <Typography id="sources-heading" variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Grounded in sources
      </Typography>
      <Paper variant="outlined" sx={{ px: 1.75, py: 0.5 }}>
        {sources.map((url, idx) => {
          let label = url;
          try {
            label = new URL(url).hostname;
          } catch {
            label = url.slice(0, 30);
          }
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                borderBottom: idx < sources.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                minWidth: 0,
              }}
            >
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
                aria-label={`${label} (opens in a new tab)`}
                sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.8125rem", fontWeight: 600 }}
              >
                {label}
              </Link>
              <OpenInNewIcon sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }} aria-hidden />
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
}
