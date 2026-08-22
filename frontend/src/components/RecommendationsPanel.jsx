import {
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function RecommendationsPanel({ recommendations = [] }) {
  if (!recommendations.length) return null;

  return (
    <Box component="section" aria-labelledby="recommendations-heading">
      <Typography id="recommendations-heading" variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Places and options related to this plan
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {recommendations.map((rec, idx) => (
          <Card key={`${rec.title}-${rec.url || idx}`} variant="outlined">
            <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 0.75 }}>
                <Typography variant="subtitle2" color="text.primary" sx={{ pr: 0.5 }}>
                  {rec.title}
                </Typography>
                {rec.type && <Chip label={rec.type} size="small" color="primary" variant="outlined" />}
              </Box>
              {rec.city && (
                <Typography variant="body2" color="text.secondary">
                  {rec.city}
                </Typography>
              )}
              {rec.url && (
                <Link
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View details for ${rec.title} (opens in a new tab)`}
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 1, fontSize: "0.8125rem", fontWeight: 600 }}
                >
                  View details <OpenInNewIcon sx={{ fontSize: 14 }} aria-hidden />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
