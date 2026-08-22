import {
  Box,
  Chip,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function RecommendationsPanel({ recommendations = [] }) {
  if (!recommendations.length) return null;

  return (
    <Box component="section" aria-labelledby="recommendations-heading">
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 1 }}>
        <Typography id="recommendations-heading" variant="subtitle2" color="text.secondary">
          Places and options related to this plan
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {recommendations.length} {recommendations.length === 1 ? "option" : "options"}
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        {recommendations.map((rec, idx) => (
          <Box
            key={`${rec.title}-${rec.url || idx}`}
            sx={{ p: 1.5, borderBottom: idx < recommendations.length - 1 ? "1px solid" : "none", borderColor: "divider" }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" color="text.primary" sx={{ overflowWrap: "anywhere" }}>
                  {rec.title}
                </Typography>
                {rec.city && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{rec.city}</Typography>}
              </Box>
              {rec.type && <Chip label={rec.type} size="small" color="primary" variant="outlined" sx={{ flexShrink: 0 }} />}
            </Box>
            {rec.url && (
              <Link
                href={rec.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View details for ${rec.title} (opens in a new tab)`}
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.75, fontSize: "0.8125rem", fontWeight: 600 }}
              >
                View details <OpenInNewIcon sx={{ fontSize: 14 }} aria-hidden />
              </Link>
            )}
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
