import { Box, Link, Paper, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

function sourceDetails(url) {
  try {
    const parsed = new URL(url);
    return {
      domain: parsed.hostname.replace(/^www\./, ""),
      label: `${parsed.pathname}${parsed.search}` || "/",
    };
  } catch {
    return { domain: "Source", label: url };
  }
}

export default function SourcesPanel({ sources = [] }) {
  if (!sources.length) return null;

  const groups = sources.reduce((grouped, url) => {
    const details = sourceDetails(url);
    const group = grouped.find((entry) => entry.domain === details.domain);
    if (group) group.sources.push({ url, label: details.label });
    else grouped.push({ domain: details.domain, sources: [{ url, label: details.label }] });
    return grouped;
  }, []);

  return (
    <Box component="section" aria-labelledby="sources-heading">
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 1 }}>
        <Typography id="sources-heading" variant="subtitle2" color="text.secondary">
          Grounded in sources
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        {groups.map((group, groupIndex) => (
            <Box
              key={group.domain}
              sx={{
                px: 1.5,
                py: 1.25,
                borderBottom: groupIndex < groups.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                minWidth: 0,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5, fontWeight: 700 }}>
                {group.domain} {group.sources.length > 1 ? `(${group.sources.length})` : ""}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {group.sources.map(({ url, label }, sourceIndex) => (
                  <Link
                    key={`${url}-${sourceIndex}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    underline="hover"
                    aria-label={`${group.domain}${label} (opens in a new tab)`}
                    title={url}
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, minWidth: 0, fontSize: "0.8125rem", fontWeight: 600, overflowWrap: "anywhere" }}
                  >
                    {label} <OpenInNewIcon sx={{ fontSize: 13, flexShrink: 0 }} aria-hidden />
                  </Link>
                ))}
              </Box>
            </Box>
        ))}
      </Paper>
    </Box>
  );
}
