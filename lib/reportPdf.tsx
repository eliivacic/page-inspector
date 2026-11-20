import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Link,
  Svg,
  Circle,
  Font,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ---------- Fonts ----------

const FONT_BASE = "https://cdn.jsdelivr.net/fontsource/fonts/figtree@latest";

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "Figtree",
    fonts: [
      { src: `${FONT_BASE}/latin-400-normal.ttf`, fontWeight: 400 },
      { src: `${FONT_BASE}/latin-600-normal.ttf`, fontWeight: 600 },
      { src: `${FONT_BASE}/latin-700-normal.ttf`, fontWeight: 700 },
      { src: `${FONT_BASE}/latin-800-normal.ttf`, fontWeight: 800 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

// ---------- Design tokens ----------

const C = {
  ink: "#1E1F21",
  soft: "#6D6E6F",
  faint: "#A2A0A2",
  border: "#EDEAE9",
  bg: "#F9F8F8",
  white: "#FFFFFF",
  coral: "#F06A6A",
  coralSoft: "#FFE9E7",
  purple: "#796EFF",
  purpleSoft: "#EEECFF",
  green: "#3E8F6C",
  greenSoft: "#E3F3EB",
  amber: "#B7791F",
  amberSoft: "#FDF1DC",
  red: "#D63C4F",
  redSoft: "#FDE5E8",
};

function scoreTone(score: number) {
  if (score >= 75) return { fg: C.green, bg: C.greenSoft, label: "Strong" };
  if (score >= 50) return { fg: C.amber, bg: C.amberSoft, label: "Needs work" };
  return { fg: C.red, bg: C.redSoft, label: "Critical" };
}

const CATEGORIES: { key: string; label: string; blurb: string }[] = [
  { key: "seo", label: "SEO", blurb: "How easily search engines find and understand your site." },
  { key: "ux", label: "User experience", blurb: "How clearly visitors can navigate and get what they came for." },
  { key: "performance", label: "Performance", blurb: "How fast and stable your pages feel." },
  { key: "accessibility", label: "Accessibility", blurb: "How usable your site is for everyone, including assistive tech." },
  { key: "conversion", label: "Conversion", blurb: "How well your site turns visitors into customers." },
  { key: "copywriting", label: "Copywriting", blurb: "How clearly and persuasively your words communicate value." },
];

const OPTION_LABELS = ["Quick fix", "Structural fix", "Long-term"];

const PRIORITY: Record<string, { fg: string; bg: string; label: string }> = {
  high: { fg: C.red, bg: C.redSoft, label: "High" },
  medium: { fg: C.amber, bg: C.amberSoft, label: "Medium" },
  low: { fg: C.green, bg: C.greenSoft, label: "Low" },
};

// ---------- Types ----------

type CategoryReport = {
  issues?: string[];
  recommendations?: string[];
  benchmark?: string;
};

export type AuditReport = {
  score?: number;
  introduction?: string;
  pages_analyzed?: { url: string; note?: string }[];
  summary?: { headline?: string; description?: string };
  category_scores?: Record<string, number>;
  priority_actions?: { priority: string; action: string }[];
} & Record<string, unknown>;

export type AuditRecord = {
  website: string;
  score: number;
  report: AuditReport;
  created_at?: string;
};

// ---------- Styles ----------

const s = StyleSheet.create({
  page: {
    fontFamily: "Figtree",
    fontSize: 10.5,
    color: C.ink,
    backgroundColor: C.white,
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 52,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 52,
    right: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    color: C.faint,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  eyebrow: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.soft,
    marginBottom: 6,
  },
  h1: { fontSize: 30, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.6 },
  h2: { fontSize: 20, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.3, marginBottom: 6 },
  h3: { fontSize: 12.5, fontWeight: 700, marginBottom: 8 },
  body: { fontSize: 10.5, color: C.ink, lineHeight: 1.6 },
  muted: { color: C.soft },
  card: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  pill: {
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 8.5,
    fontWeight: 700,
  },
});

// ---------- Building blocks ----------

function Footer({ website }: { website: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>Page Inspector · Audit for {website}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function ScoreRing({ score, size = 132 }: { score: number; size?: number }) {
  const stroke = size * 0.085;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const tone = scoreTone(score);

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone.fg}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circumference * score) / 100} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: size * 0.3, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>{score}</Text>
        <Text style={{ fontSize: 8.5, color: C.soft, marginTop: 4 }}>out of 100</Text>
      </View>
    </View>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const tone = scoreTone(value);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 11 }}>
      <Text style={{ width: 110, fontSize: 10, fontWeight: 600 }}>{label}</Text>
      <View style={{ flex: 1, height: 8, backgroundColor: C.bg, borderRadius: 4 }}>
        <View style={{ width: `${Math.max(2, value)}%`, height: 8, backgroundColor: tone.fg, borderRadius: 4 }} />
      </View>
      <Text style={{ width: 34, textAlign: "right", fontSize: 10, fontWeight: 700, color: tone.fg }}>{value}</Text>
    </View>
  );
}

function Checkbox() {
  return (
    <View
      style={{
        width: 13,
        height: 13,
        borderRadius: 7,
        borderWidth: 1.2,
        borderColor: C.faint,
        marginTop: 1.5,
        marginRight: 10,
      }}
    />
  );
}

// ---------- Pages ----------

function CoverPage({ audit, date }: { audit: AuditRecord; date: string }) {
  const r = audit.report;
  const tone = scoreTone(audit.score);

  return (
    <Page size="A4" style={{ ...s.page, padding: 0 }}>
      <View style={{ backgroundColor: C.coralSoft, paddingTop: 52, paddingHorizontal: 52, paddingBottom: 44 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 90 }}>
          <View style={{ flexDirection: "row", marginRight: 8 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.coral, marginRight: 3 }} />
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.purple, marginRight: 3 }} />
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.ink }} />
          </View>
          <Text style={{ fontSize: 11, fontWeight: 800 }}>Page Inspector</Text>
        </View>

        <Text style={s.eyebrow}>Website audit report</Text>
        <Text style={{ ...s.h1, fontSize: 36, marginBottom: 10 }}>
          {audit.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </Text>
        <Text style={{ fontSize: 11, color: C.soft }}>Prepared {date}</Text>
      </View>

      <View style={{ paddingHorizontal: 52, paddingTop: 40, flexDirection: "row", alignItems: "center" }}>
        <ScoreRing score={audit.score} />
        <View style={{ flex: 1, marginLeft: 28 }}>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <Text style={{ ...s.pill, color: tone.fg, backgroundColor: tone.bg }}>{tone.label}</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>{r.summary?.headline || ""}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 52, paddingTop: 34 }}>
        <Text style={s.eyebrow}>Score by area</Text>
        <View style={{ marginTop: 6 }}>
          {CATEGORIES.filter((c) => typeof r.category_scores?.[c.key] === "number").map((c) => (
            <ScoreBar key={c.key} label={c.label} value={r.category_scores![c.key]} />
          ))}
        </View>
      </View>

      <Footer website={audit.website} />
    </Page>
  );
}

function OverviewPage({ audit }: { audit: AuditRecord }) {
  const r = audit.report;
  const pages = Array.isArray(r.pages_analyzed) ? r.pages_analyzed : [];

  return (
    <Page size="A4" style={s.page}>
      <Text style={s.eyebrow}>Overview</Text>
      <Text style={{ ...s.h2, marginBottom: 14 }}>Executive summary</Text>
      <Text style={{ ...s.body, fontSize: 11.5, lineHeight: 1.6, marginBottom: 22 }}>{r.summary?.description || ""}</Text>

      {r.introduction ? (
        <View style={{ backgroundColor: C.bg, borderRadius: 10, padding: 18, marginBottom: 26 }}>
          <Text style={s.h3}>About this audit</Text>
          <Text style={{ ...s.body, color: C.soft }}>{r.introduction}</Text>
        </View>
      ) : null}

      {pages.length > 0 ? (
        <View>
          <Text style={s.h3}>Pages analyzed ({pages.length})</Text>
          {pages.map((p, i) => (
            <View
              key={i}
              wrap={false}
              style={{
                flexDirection: "row",
                paddingVertical: 9,
                borderBottomWidth: i === pages.length - 1 ? 0 : 1,
                borderBottomColor: C.border,
              }}
            >
              <Text style={{ width: 22, fontSize: 9.5, fontWeight: 700, color: C.faint }}>
                {String(i + 1).padStart(2, "0")}
              </Text>
              <View style={{ flex: 1 }}>
                <Link src={p.url} style={{ fontSize: 10, fontWeight: 700, color: C.purple, textDecoration: "none" }}>
                  {p.url}
                </Link>
                {p.note ? <Text style={{ fontSize: 9.5, color: C.soft, marginTop: 2 }}>{p.note}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <Footer website={audit.website} />
    </Page>
  );
}

function CategoryPage({
  audit,
  category,
  index,
}: {
  audit: AuditRecord;
  category: (typeof CATEGORIES)[number];
  index: number;
}) {
  const data = audit.report[category.key] as CategoryReport | undefined;
  if (!data) return null;

  const score = audit.report.category_scores?.[category.key];
  const tone = typeof score === "number" ? scoreTone(score) : null;

  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <View style={{ flex: 1, paddingRight: 20 }}>
          <Text style={s.eyebrow}>
            Area {index + 1} of {CATEGORIES.length}
          </Text>
          <Text style={s.h2}>{category.label}</Text>
          <Text style={{ fontSize: 10.5, color: C.soft }}>{category.blurb}</Text>
        </View>
        {tone && typeof score === "number" ? (
          <View style={{ alignItems: "center", backgroundColor: tone.bg, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 800, color: tone.fg, lineHeight: 1 }}>{score}</Text>
            <Text style={{ fontSize: 8, fontWeight: 700, color: tone.fg, marginTop: 3 }}>{tone.label.toUpperCase()}</Text>
          </View>
        ) : null}
      </View>

      {data.issues?.length ? (
        <View style={{ marginBottom: 14 }}>
          <Text style={s.h3}>What we found</Text>
          {data.issues.map((issue, i) => (
            <View key={i} wrap={false} style={{ ...s.card, flexDirection: "row", paddingVertical: 12 }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: C.coralSoft,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: 800, color: C.coral }}>{i + 1}</Text>
              </View>
              <Text style={{ ...s.body, flex: 1 }}>{issue}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {data.recommendations?.length ? (
        <View style={{ marginBottom: 14 }}>
          <Text style={s.h3}>How to fix it</Text>
          {data.recommendations.map((rec, i) => (
            <View
              key={i}
              wrap={false}
              style={{
                flexDirection: "row",
                backgroundColor: C.purpleSoft,
                borderRadius: 10,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <View style={{ width: 96 }}>
                <Text style={{ fontSize: 8.5, fontWeight: 800, color: C.purple, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {OPTION_LABELS[i] || `Option ${String.fromCharCode(65 + i)}`}
                </Text>
              </View>
              <Text style={{ ...s.body, flex: 1 }}>{rec}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {data.benchmark ? (
        <View wrap={false} style={{ borderLeftWidth: 3, borderLeftColor: C.ink, paddingLeft: 14, paddingVertical: 4, marginTop: 6 }}>
          <Text style={{ ...s.eyebrow, marginBottom: 3 }}>Industry benchmark</Text>
          <Text style={{ ...s.body, color: C.soft }}>{data.benchmark}</Text>
        </View>
      ) : null}

      <Footer website={audit.website} />
    </Page>
  );
}

function ActionPlanPage({ audit }: { audit: AuditRecord }) {
  const r = audit.report;
  const priorities = Array.isArray(r.priority_actions) ? r.priority_actions : [];

  const quickWins = CATEGORIES.map((c) => {
    const rec = (r[c.key] as CategoryReport | undefined)?.recommendations?.[0];
    return rec ? { area: c.label, text: rec } : null;
  }).filter(Boolean) as { area: string; text: string }[];

  return (
    <Page size="A4" style={s.page}>
      <Text style={s.eyebrow}>Next steps</Text>
      <Text style={{ ...s.h2, marginBottom: 6 }}>Your action plan</Text>
      <Text style={{ fontSize: 10.5, color: C.soft, marginBottom: 20 }}>
        Work through these in order. Tick each one off as you go.
      </Text>

      {priorities.length > 0 ? (
        <View style={{ borderWidth: 1, borderColor: C.border, borderRadius: 10, marginBottom: 26 }}>
          <View style={{ flexDirection: "row", backgroundColor: C.bg, paddingVertical: 8, paddingHorizontal: 14, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            <Text style={{ flex: 1, fontSize: 8.5, fontWeight: 700, color: C.soft }}>TASK</Text>
            <Text style={{ width: 60, fontSize: 8.5, fontWeight: 700, color: C.soft, textAlign: "right" }}>PRIORITY</Text>
          </View>
          {priorities.map((p, i) => {
            const tone = PRIORITY[p.priority?.toLowerCase()] || PRIORITY.medium;
            return (
              <View
                key={i}
                wrap={false}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderTopWidth: 1,
                  borderTopColor: C.border,
                }}
              >
                <Checkbox />
                <Text style={{ ...s.body, flex: 1, paddingRight: 12 }}>{p.action}</Text>
                <View style={{ width: 60, alignItems: "flex-end" }}>
                  <Text style={{ ...s.pill, color: tone.fg, backgroundColor: tone.bg }}>{tone.label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {quickWins.length > 0 ? (
        <View>
          <Text style={s.h3}>Quick wins by area</Text>
          {quickWins.map((q, i) => (
            <View key={i} wrap={false} style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <Checkbox />
              <Text style={{ width: 92, fontSize: 9.5, fontWeight: 700 }}>{q.area}</Text>
              <Text style={{ flex: 1, fontSize: 9.5, color: C.soft, lineHeight: 1.5 }}>{q.text}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View wrap={false} style={{ backgroundColor: C.ink, borderRadius: 12, padding: 20, marginTop: 26 }}>
        <Text style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4 }}>Made changes? Check your progress.</Text>
        <Text style={{ fontSize: 10, color: "#C9C7C8" }}>
          Run a fresh audit at{" "}
          <Link src="https://www.page-inspector.com" style={{ color: C.coral, textDecoration: "none" }}>
            page-inspector.com
          </Link>{" "}
          to see how your score improves.
        </Text>
      </View>

      <Footer website={audit.website} />
    </Page>
  );
}

function ReportDocument({ audit, date }: { audit: AuditRecord; date: string }) {
  return (
    <Document
      title={`Website audit — ${audit.website}`}
      author="Page Inspector"
      subject="Website audit report"
    >
      <CoverPage audit={audit} date={date} />
      <OverviewPage audit={audit} />
      {CATEGORIES.map((c, i) => (
        <CategoryPage key={c.key} audit={audit} category={c} index={i} />
      ))}
      <ActionPlanPage audit={audit} />
    </Document>
  );
}

export async function renderReportPdf(audit: AuditRecord): Promise<Buffer> {
  registerFonts();
  const date = new Date(audit.created_at || Date.now()).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return renderToBuffer(<ReportDocument audit={audit} date={date} />);
}
