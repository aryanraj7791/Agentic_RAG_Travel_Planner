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
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Recommendations
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {recommendations.map((rec, idx) => (
          <Card key={idx} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {rec.title}
                </Typography>
                <Chip label={rec.type} size="small" color="primary" variant="outlined" />
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
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
                >
                  View source <OpenInNewIcon sx={{ fontSize: 14 }} />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
