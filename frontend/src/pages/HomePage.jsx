import { Box } from "@mui/material";
import Hero from "../components/landing/Hero";
import SuggestedDestinations from "../components/landing/SuggestedDestinations";
import FeatureRow from "../components/landing/FeatureRow";
import HowItWorks from "../components/landing/HowItWorks";
import TechnologySection from "../components/landing/TechnologySection";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

export default function HomePage() {
  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Hero />
      <SuggestedDestinations />
      <FeatureRow />
      <HowItWorks />
      <TechnologySection />
      <FinalCTA />
      <Footer />
    </Box>
  );
}
