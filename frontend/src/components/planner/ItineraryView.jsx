import { Box, Link, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { memo } from "react";
import remarkGfm from "remark-gfm";

const DAY_HEADING = /^day\s*(\d+)\s*(?::|\-|\u2013|\u2014)?\s*(.*)$/i;
const PERIOD_HEADING = /^(morning|afternoon|evening|night|arrival|departure|travel)(?:\s*\(([^)]+)\))?$/i;
const CALLOUT = /^(budget|estimated cost|travel time|distance|weather(?: note)?|transport(?: note)?|important(?: note)?|tips?|things to carry|safety(?: note)?|opening(?:\/closing)? considerations?)\s*:/i;

function textFromChildren(children) {
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (children?.props?.children) return textFromChildren(children.props.children);
  return "";
}

function DayHeading({ children }) {
  const heading = textFromChildren(children).trim();
  const match = heading.match(DAY_HEADING);

  if (!match) {
    return <Typography component="h2" variant="h5" sx={{ mt: 3, mb: 1.25 }}>{children}</Typography>;
  }

  const [, dayNumber, title] = match;
  return (
    <Box component="h2" sx={{ mt: 3.5, mb: 1.75, pt: 1.5, borderTop: "2px solid", borderColor: "secondary.main" }}>
      <Typography variant="overline" component="span" sx={{ color: "secondary.main", fontWeight: 700 }}>
        Day {dayNumber}
      </Typography>
      {title && (
        <Typography variant="h5" component="span" sx={{ display: "block", mt: 0.25, color: "text.primary" }}>
          {title}
        </Typography>
      )}
    </Box>
  );
}

function ActivityHeading({ children }) {
  const heading = textFromChildren(children).trim();
  const match = heading.match(PERIOD_HEADING);

  if (!match) {
    return <Typography component="h3" variant="h6" sx={{ mt: 2.25, mb: 0.75 }}>{children}</Typography>;
  }

  const [, period, time] = match;
  return (
    <Box sx={{ mt: 2.25, mb: 0.75, pl: 1.25, borderLeft: "2px solid", borderColor: "secondary.main" }}>
      <Typography component="h3" variant="subtitle2" sx={{ color: "text.primary", textTransform: "uppercase" }}>
        {period}
      </Typography>
      {time && <Typography variant="caption" component="p" sx={{ mt: 0.15 }}>{time}</Typography>}
    </Box>
  );
}

function Paragraph({ children }) {
  const text = textFromChildren(children).trim();
  const isCallout = CALLOUT.test(text);

  return (
    <Box
      component="p"
      sx={isCallout ? {
        my: 1.25,
        px: 1.5,
        py: 1.1,
        borderLeft: "3px solid",
        borderColor: "secondary.main",
        bgcolor: "background.default",
        borderRadius: "0 8px 8px 0",
      } : undefined}
    >
      {children}
    </Box>
  );
}

function MarkdownLink({ href, children }) {
  const isExternal = typeof href === "string" && /^https?:\/\//i.test(href);
  const label = textFromChildren(children);
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      aria-label={isExternal && label ? `${label} (opens in a new tab)` : undefined}
      sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
    >
      {children}
    </Link>
  );
}

const ItineraryView = memo(function ItineraryView({ content }) {
  const markdown = typeof content === "string" ? content.trim() : "";

  if (!markdown) {
    return <Typography variant="body2">I couldn&apos;t generate a travel response. Please try again.</Typography>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <Box component="header" sx={{ mb: 2.25, pb: 1.75, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography component="h1" variant="h4">{children}</Typography>
          </Box>
        ),
        h2: ({ children }) => <DayHeading>{children}</DayHeading>,
        h3: ({ children }) => <ActivityHeading>{children}</ActivityHeading>,
        p: Paragraph,
        a: MarkdownLink,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
});

export default ItineraryView;
