import { useState } from "react";
import { Box, Card, CardActionArea, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { startPlanning } from "./startPlanning";

const DESTINATIONS = [
  {
    name: "Goa",
    blurb: "Beaches · Food · Escape",
    prompt: "Plan a 3-day trip to Goa",
    image:
      "https://images.pexels.com/photos/23630487/pexels-photo-23630487.jpeg?auto=compress&cs=tinysrgb&w=720",
    alt: "Palm-lined beach and turquoise water in Goa",
  },
  {
    name: "Kerala",
    blurb: "Backwaters · Spice · Slow travel",
    prompt: "Plan a 5-day trip to Kerala",
    image:
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=720&q=70",
    alt: "Houseboat on the Kerala backwaters",
  },
  {
    name: "Kashmir",
    blurb: "Lakes · Mountains · Quiet",
    prompt: "Plan a 5-day trip to Kashmir",
    image:
      "https://images.pexels.com/photos/18289517/pexels-photo-18289517.jpeg?auto=compress&cs=tinysrgb&w=720",
    alt: "Mountain valley landscape in Kashmir",
  },
  {
    name: "Bali",
    blurb: "Temples · Rice terraces · Rest",
    prompt: "Plan a 7-day trip to Bali",
    image:
      "https://images.pexels.com/photos/37443142/pexels-photo-37443142.jpeg?auto=compress&cs=tinysrgb&w=720",
    alt: "Temple gates and tropical greenery in Bali",
  },
];

function DestinationImage({ place }) {
  const [hasFailed, setHasFailed] = useState(false);

  if (hasFailed) {
    return (
      <Box
        role="img"
        aria-label={place.alt}
        sx={{
          width: "100%",
          height: "100%",
          display: "grid",
          alignContent: "end",
          p: 2,
          color: "primary.contrastText",
          background:
            "linear-gradient(135deg, #1E3A4C 0%, #3D6B8A 55%, #B85C38 100%)",
        }}
      >
        <Typography variant="subtitle2" sx={{ color: "inherit", opacity: 0.8 }}>
          Destination guide
        </Typography>
        <Typography variant="h5" sx={{ color: "inherit" }}>
          {place.name}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={place.image}
      alt={place.alt}
      loading="lazy"
      onError={() => setHasFailed(true)}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        transition: "transform 0.4s ease",
      }}
    />
  );
}

export default function SuggestedDestinations() {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      aria-labelledby="destinations-heading"
      sx={{ py: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="lg">
        <Typography id="destinations-heading" variant="h2" sx={{ mb: 1 }}>
          Explore your next destination
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 520 }}>
          Choose a place to begin. Each card opens the planner with a ready-made prompt — no booking, just a smarter starting point.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
            gap: 2.5,
          }}
        >
          {DESTINATIONS.map((place) => (
            <Card key={place.name} sx={{ overflow: "hidden" }}>
              <CardActionArea
                onClick={() => startPlanning(navigate, place.prompt)}
                aria-label={`Plan a trip to ${place.name}`}
                sx={{
                  alignItems: "stretch",
                  height: "100%",
                  "&:hover img": { transform: "scale(1.05)" },
                }}
              >
                <Box sx={{ overflow: "hidden", height: 180 }}>
                  <DestinationImage place={place} />
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" component="h3">{place.name}</Typography>
                  <Typography variant="body2">{place.blurb}</Typography>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
