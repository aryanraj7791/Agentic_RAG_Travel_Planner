import { Box, Chip, Link, Typography } from "@mui/material";

export default function SourcesPanel({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Sources
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {sources.map((url, idx) => {
          let label = url;
          try {
            label = new URL(url).hostname;
          } catch {
            label = url.slice(0, 30);
          }
          return (
            <Chip
              key={idx}
              label={
                <Link href={url} target="_blank" rel="noopener noreferrer" color="inherit" underline="hover">
                  {label}
                </Link>
              }
              size="small"
              variant="outlined"
            />
          );
        })}
      </Box>
    </Box>
  );
}
