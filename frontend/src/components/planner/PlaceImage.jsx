import { Box } from "@mui/material";
import { useState } from "react";

export default function PlaceImage({ place }) {
  const [hasFailed, setHasFailed] = useState(false);

  if (!place || hasFailed) return null;

  return (
    <Box
      component="img"
      src={place.src}
      alt={place.alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasFailed(true)}
      sx={{
        display: "block",
        width: "100%",
        aspectRatio: "16 / 7",
        objectFit: "cover",
        borderRadius: 1.25,
        mb: 1.5,
      }}
    />
  );
}
