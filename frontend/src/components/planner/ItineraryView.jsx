import { Box, Link, Paper, Typography } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloudIcon from "@mui/icons-material/Cloud";
import CommuteIcon from "@mui/icons-material/Commute";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SecurityIcon from "@mui/icons-material/Security";
import StraightenIcon from "@mui/icons-material/Straighten";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import ReactMarkdown from "react-markdown";
import { memo } from "react";
import remarkGfm from "remark-gfm";

const DAY_HEADING = /^day\s*(\d+)\s*(?::|\-|\u2013|\u2014)?\s*(.*)$/i;
const PERIOD_LABEL = "early morning|late morning|morning|mid-day|afternoon|evening|night|arrival|departure|travel|breakfast|lunch|dinner";
const PERIOD_HEADING = new RegExp(`^(${PERIOD_LABEL})(?:\\s*\\(([^)]+)\\))?(?:\\s*:\\s*(.*))?$`, "i");
const ACTIVITY_LIST_ITEM = new RegExp(`^\\s*(?:[-+*]|\\d+[.)])\\s+\\*\\*(${PERIOD_LABEL})(?:\\s*\\(([^)]+)\\))?\\s*:\\s*([^*]*?)\\*\\*\\s*(.*)$`, "i");
const CALLOUT = /^(budget|estimated cost|travel time|distance|weather(?: note)?|transport(?: note)?|important(?: note)?|tips?|things to carry|safety(?: note)?|opening(?:\/closing)? considerations?)\s*:/i;
const SOURCE_FOOTER = /\n---\s*\n\*\*Sources:\*\*\s*\n(?:\d+\.\s+https?:\/\/[^\s]+\s*\n?)+\s*$/i;

const PERIOD_PRESENTATION = {
  morning: { Icon: WbSunnyIcon, background: "#FFF6DF", border: "#E9C66C", color: "#8A5A00" },
  "early morning": { Icon: WbSunnyIcon, background: "#FFF6DF", border: "#E9C66C", color: "#8A5A00" },
  "late morning": { Icon: WbSunnyIcon, background: "#FFF6DF", border: "#E9C66C", color: "#8A5A00" },
  "mid-day": { Icon: WbSunnyIcon, background: "#EAF5FF", border: "#91C5E8", color: "#235C7B" },
  afternoon: { Icon: WbSunnyIcon, background: "#EAF5FF", border: "#91C5E8", color: "#235C7B" },
  evening: { Icon: WbTwilightIcon, background: "#F0EDFF", border: "#B9AFE5", color: "#55428D" },
  night: { Icon: NightsStayIcon, background: "#ECEFFC", border: "#9BA8DA", color: "#34477E" },
  arrival: { Icon: FlightLandIcon, background: "#E8F5F2", border: "#8FC9BE", color: "#286C63" },
  departure: { Icon: FlightTakeoffIcon, background: "#E8F5F2", border: "#8FC9BE", color: "#286C63" },
  travel: { Icon: DirectionsCarIcon, background: "#E8F5F2", border: "#8FC9BE", color: "#286C63" },
  breakfast: { Icon: FreeBreakfastIcon, background: "#FFF0E8", border: "#E5AA79", color: "#93472A" },
  lunch: { Icon: RestaurantIcon, background: "#FFF0E8", border: "#E5AA79", color: "#93472A" },
  dinner: { Icon: RestaurantIcon, background: "#FFF0E8", border: "#E5AA79", color: "#93472A" },
};

function textFromChildren(children) {
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (children?.props?.children) return textFromChildren(children.props.children);
  return "";
}

function calloutPresentation(label) {
  const normalized = label.toLowerCase();
  if (/budget|estimated cost/.test(normalized)) return { Icon: AccountBalanceWalletIcon, background: "#EAF5EE", border: "#7DB794", color: "#286044" };
  if (/travel time/.test(normalized)) return { Icon: ScheduleIcon, background: "#EAF3F8", border: "#87B7CD", color: "#2B647D" };
  if (/distance/.test(normalized)) return { Icon: StraightenIcon, background: "#F4EFE8", border: "#C9B49B", color: "#775A3C" };
  if (/weather/.test(normalized)) return { Icon: CloudIcon, background: "#EAF3F8", border: "#87B7CD", color: "#2B647D" };
  if (/transport/.test(normalized)) return { Icon: CommuteIcon, background: "#E8F5F2", border: "#8FC9BE", color: "#286C63" };
  if (/safety|important|opening/.test(normalized)) return { Icon: SecurityIcon, background: "#FFF0E8", border: "#E5AA79", color: "#93472A" };
  if (/tips|things to carry/.test(normalized)) return { Icon: LightbulbIcon, background: "#FFF6DF", border: "#E9C66C", color: "#8A5A00" };
  return { Icon: InfoOutlinedIcon, background: "#F1F3F5", border: "#B8C0C8", color: "#4F5B66" };
}

function Paragraph({ children }) {
  const text = textFromChildren(children).trim();
  const calloutMatch = text.match(CALLOUT);
  if (!calloutMatch) return <Box component="p">{children}</Box>;

  const presentation = calloutPresentation(calloutMatch[1]);
  const { Icon } = presentation;
  return (
    <Box component="aside" role="note" aria-label={`${calloutMatch[1]} note`} sx={{ display: "flex", alignItems: "flex-start", gap: 1, my: 1.5, px: { xs: 1.25, sm: 1.5 }, py: 1.15, border: "1px solid", borderColor: presentation.border, bgcolor: presentation.background, borderRadius: 1.5, color: "text.primary" }}>
      <Box aria-hidden="true" sx={{ display: "grid", placeItems: "center", width: 26, height: 26, mt: 0.1, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.66)", color: presentation.color, flexShrink: 0 }}><Icon sx={{ fontSize: 16 }} /></Box>
      <Box sx={{ minWidth: 0, "& p": { m: 0 } }}>{children}</Box>
    </Box>
  );
}

function MarkdownList({ ordered = false, children }) {
  return <Box component={ordered ? "ol" : "ul"} sx={{ my: 1.5, pl: { xs: 2.5, sm: 3 }, "& li": { mb: 0.6, pl: 0.25 }, "& ul, & ol": { my: 0.75 } }}>{children}</Box>;
}

function MarkdownLink({ href, children }) {
  const isExternal = typeof href === "string" && /^https?:\/\//i.test(href);
  const label = textFromChildren(children);
  return <Link href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} aria-label={isExternal && label ? `${label} (opens in a new tab)` : undefined} sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{children}</Link>;
}

function normalizeActivityMarkdown(markdown) {
  const lines = markdown.split("\n");
  const indents = lines
    .map((line) => line.match(/^(\s+)(?:[-+*]|\d+[.)])\s+/)?.[1].length)
    .filter((indent) => typeof indent === "number");
  const baseIndent = indents.length ? Math.min(...indents) : 0;

  if (baseIndent < 2) return markdown;
  const leadingIndent = new RegExp(`^ {${baseIndent}}`);
  return lines.map((line) => line.replace(leadingIndent, "")).join("\n");
}

function activityMeta(value) {
  if (!value) return null;
  const isTime = /\b\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)\b|\bnoon\b|\bonwards\b/i.test(value);
  return { value, isTime };
}

function MarkdownContent({ markdown }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      h1: ({ children }) => <Box component="header" sx={{ mb: 2.25, pb: 1.75, borderBottom: "1px solid", borderColor: "divider" }}><Typography component="h1" variant="h4">{children}</Typography></Box>,
      h2: ({ children }) => <Typography component="h2" variant="h5" sx={{ mt: 3, mb: 1.25 }}>{children}</Typography>,
      h3: ({ children }) => <Typography component="h3" variant="h6" sx={{ mt: 2.25, mb: 0.75 }}>{children}</Typography>,
      h4: ({ children }) => <Typography component="h4" variant="subtitle1" sx={{ mt: 2.25, mb: 0.75 }}>{children}</Typography>,
      p: Paragraph,
      ul: ({ children }) => <MarkdownList>{children}</MarkdownList>,
      ol: ({ children }) => <MarkdownList ordered>{children}</MarkdownList>,
      a: MarkdownLink,
    }}>{markdown}</ReactMarkdown>
  );
}

function headingText(line, level) {
  const match = line.match(new RegExp(`^#{${level}}\\s+(.+?)\\s*$`));
  return match ? match[1] : null;
}

function splitItinerary(markdown) {
  const sections = [];
  let lines = [];
  let currentDay = null;
  let currentActivity = null;
  let inCodeFence = false;
  const flushPlain = () => {
    const value = lines.join("\n").trim();
    if (value) sections.push({ type: "markdown", markdown: value });
    lines = [];
  };
  const flushDayContent = () => {
    const value = lines.join("\n").replace(/\s+$/, "");
    if (!value.trim() || !currentDay) return;
    if (currentActivity) currentActivity.markdown = `${currentActivity.markdown}\n${value}`.trim();
    else currentDay.markdown = `${currentDay.markdown}\n${value}`.trim();
    lines = [];
  };
  const flushDay = () => {
    if (!currentDay) return;
    flushDayContent();
    sections.push(currentDay);
    currentDay = null;
    currentActivity = null;
  };

  markdown.split("\n").forEach((line) => {
    if (/^\s*(```|~~~)/.test(line)) inCodeFence = !inCodeFence;
    if (!inCodeFence) {
      const dayText = (headingText(line, 2) || headingText(line, 3))?.replace(/^\*\*(.*?)\*\*$/, "$1");
      const dayMatch = dayText?.match(DAY_HEADING);
      if (dayMatch) {
        if (currentDay) flushDay(); else flushPlain();
        currentDay = { type: "day", number: dayMatch[1], title: dayMatch[2], markdown: "", activities: [] };
        return;
      }
      const periodMatch = currentDay && headingText(line, 3)?.match(PERIOD_HEADING);
      if (periodMatch) {
        flushDayContent();
        currentActivity = { period: periodMatch[1], time: periodMatch[2], title: periodMatch[3]?.trim(), markdown: "" };
        currentDay.activities.push(currentActivity);
        return;
      }
      const listActivityMatch = currentDay && line.match(ACTIVITY_LIST_ITEM);
      if (listActivityMatch) {
        flushDayContent();
        currentActivity = {
          period: listActivityMatch[1],
          time: listActivityMatch[2],
          title: listActivityMatch[3].trim(),
          markdown: listActivityMatch[4],
        };
        currentDay.activities.push(currentActivity);
        return;
      }
    }
    lines.push(line);
  });
  if (currentDay) flushDay(); else flushPlain();
  return sections;
}

function ActivityCard({ activity, dayNumber, index }) {
  const presentation = PERIOD_PRESENTATION[activity.period.toLowerCase()];
  const { Icon } = presentation;
  const meta = activityMeta(activity.time);
  const MetaIcon = meta?.isTime ? ScheduleIcon : InfoOutlinedIcon;
  const headingId = `day-${dayNumber}-activity-${index}`;
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "26px minmax(0, 1fr)", sm: "34px minmax(0, 1fr)" }, columnGap: { xs: 0.75, sm: 1.25 }, minWidth: 0 }}>
      <Box aria-hidden="true" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Box sx={{ width: 12, height: 12, mt: 1.75, borderRadius: "50%", bgcolor: presentation.color, border: "3px solid", borderColor: presentation.background, boxSizing: "content-box", zIndex: 1 }} /><Box sx={{ width: 1, flex: 1, minHeight: 24, bgcolor: "divider" }} /></Box>
      <Paper component="section" aria-labelledby={headingId} variant="outlined" sx={{ minWidth: 0, mb: { xs: 1.25, sm: 1.75 }, p: { xs: 1.5, sm: 1.75 }, borderColor: presentation.border, borderLeft: "3px solid", borderLeftColor: presentation.color, borderRadius: 2, bgcolor: "background.paper", boxShadow: "0 2px 8px rgba(26, 35, 50, 0.045)" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: activity.markdown ? 1.25 : 0, minWidth: 0 }}>
          <Box aria-hidden="true" sx={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 1.25, bgcolor: presentation.background, color: presentation.color, flexShrink: 0 }}><Icon sx={{ fontSize: 20 }} /></Box>
          <Box sx={{ minWidth: 0, pt: 0.1 }}><Typography id={headingId} component="h3" variant="overline" sx={{ display: "block", color: presentation.color, fontWeight: 700 }}>{activity.period}</Typography>{activity.title && <Typography variant="subtitle1" sx={{ mt: 0.1, color: "text.primary", fontWeight: 700, lineHeight: 1.35 }}>{activity.title}</Typography>}{meta && <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.45, mt: 0.5, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: presentation.background, color: presentation.color }}><MetaIcon aria-hidden="true" sx={{ fontSize: 13 }} /><Typography variant="caption" sx={{ color: "inherit", fontWeight: 600 }}>{meta.value}</Typography></Box>}</Box>
        </Box>
        {activity.markdown && <MarkdownContent markdown={normalizeActivityMarkdown(activity.markdown)} />}
      </Paper>
    </Box>
  );
}

function DaySection({ day }) {
  const headingId = `day-${day.number}-heading`;
  return (
    <Box component="section" aria-labelledby={headingId} sx={{ mt: { xs: 3.5, sm: 4.5 }, pt: { xs: 2, sm: 2.5 }, borderTop: "1px solid", borderColor: "divider" }}>
      <Box component="header" sx={{ display: "flex", alignItems: "baseline", gap: 1.25, mb: { xs: 2, sm: 2.25 }, pl: 1.25, borderLeft: "3px solid", borderColor: "secondary.main" }}>
        <Typography component="span" variant="overline" sx={{ color: "secondary.main", fontWeight: 700, px: 1, py: 0.35, bgcolor: "rgba(184, 92, 56, 0.10)", borderRadius: 1 }}>Day {day.number}</Typography>
        {day.title ? <Typography id={headingId} component="h2" variant="h5">{day.title}</Typography> : <Typography id={headingId} component="h2" variant="h5" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>Day {day.number}</Typography>}
      </Box>
      {day.markdown && <Box sx={{ mb: day.activities.length ? 1.5 : 0 }}><MarkdownContent markdown={day.markdown} /></Box>}
      {day.activities.map((activity, index) => <ActivityCard key={`${activity.period}-${index}`} activity={activity} dayNumber={day.number} index={index} />)}
    </Box>
  );
}

const ItineraryView = memo(function ItineraryView({ content, hasDedicatedSources = false }) {
  const rawMarkdown = typeof content === "string" ? content.trim() : "";
  const markdown = hasDedicatedSources ? rawMarkdown.replace(SOURCE_FOOTER, "").trim() : rawMarkdown;
  if (!markdown) return <Typography variant="body2">I couldn&apos;t generate a travel response. Please try again.</Typography>;

  return <Box sx={{ minWidth: 0, "& table": { display: "block", maxWidth: "100%", overflowX: "auto", my: 1.5 }, "& pre": { maxWidth: "100%" } }}>{splitItinerary(markdown).map((section, index) => section.type === "day" ? <DaySection key={`day-${section.number}-${index}`} day={section} /> : <MarkdownContent key={`markdown-${index}`} markdown={section.markdown} />)}</Box>;
});

export default ItineraryView;
