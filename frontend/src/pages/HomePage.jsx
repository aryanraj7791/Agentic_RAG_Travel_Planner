import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SourceIcon from "@mui/icons-material/Source";
import { Link as RouterLink } from "react-router-dom";

const features = [
  {
    icon: <PsychologyIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Agentic Planning",
    desc: "LangGraph agent understands intent, asks clarifying questions, and builds personalized itineraries.",
  },
  {
    icon: <SourceIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Grounded Answers",
    desc: "Hybrid RAG (BM25 + Qdrant) retrieves travel knowledge with cited source URLs.",
  },
  {
    icon: <ExploreIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Live Tools",
    desc: "Weather, currency, maps, places, and web search enrich every recommendation.",
  },
];

export default function HomePage() {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #e3f2fd 0%, #e0f2f1 100%)",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>
            Agentic RAG Travel Planner
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 640, mx: "auto", mb: 4 }}>
            An intelligent travel assistant powered by Gemini 3.5 Flash, LangGraph,
            and hybrid retrieval — built for production deployment.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/chat"
            sx={{ px: 4, py: 1.5, borderRadius: 3 }}
          >
            Start Planning
          </Button>
        </Box>

        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid item xs={12} md={4} key={f.title}>
              <Paper elevation={0} sx={{ p: 3, height: "100%", borderRadius: 3 }}>
                <Box sx={{ mb: 2 }}>{f.icon}</Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {f.title}
                </Typography>
                <Typography color="text.secondary">{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
