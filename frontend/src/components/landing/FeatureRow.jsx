import { Box, Container, Typography } from "@mui/material";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";

const BENEFITS = [
  {
    title: "Personalized planning",
    desc: "Build a trip around your destination, duration, preferences, and constraints.",
    Icon: PersonSearchOutlinedIcon,
  },
  {
    title: "Live travel intelligence",
    desc: "Weather, currency, distance, maps, and web research inform the plan as you go.",
    Icon: TravelExploreOutlinedIcon,
  },
  {
    title: "Grounded recommendations",
    desc: "Suggestions are backed by retrieved sources — not generic model knowledge alone.",
    Icon: MenuBookOutlinedIcon,
  },
  {
    title: "Multi-turn planning",
    desc: "When details are missing, the assistant asks follow-up questions before it plans.",
    Icon: ForumOutlinedIcon,
  },
];

export default function FeatureRow() {
  return (
    <Box
      component="section"
      aria-labelledby="benefits-heading"
      sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.paper" }}
    >
      <Container maxWidth="lg">
        <Typography id="benefits-heading" variant="h2" sx={{ mb: 1 }}>
          Travel planning, without the guesswork.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 5, maxWidth: 540 }}>
          Ask in plain language. The planner researches, clarifies, and returns an itinerary you can actually use.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
          }}
        >
          {BENEFITS.map(({ title, desc, Icon }) => (
            <Box
              key={title}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  mb: 2,
                  color: "primary.main",
                }}
              >
                <Icon aria-hidden fontSize="small" />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2">{desc}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
