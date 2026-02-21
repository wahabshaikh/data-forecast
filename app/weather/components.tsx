"use client";

import {
  formatNumber,
  formatCurrency,
  formatDuration,
  getBounceRateLabel,
  getConversionLabel,
  type TimeseriesPoint,
  type ForecastPoint,
} from "./utils";

/* ------------------------------------------------------------------ */
/*  Shared card wrapper                                                */
/* ------------------------------------------------------------------ */

function Card({
  children,
  className = "",
  label,
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[18px] bg-white/15 backdrop-blur-xl border border-white/20 p-3.5 overflow-hidden ${className}`}
    >
      {label && (
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/50 uppercase mb-1.5">
          {icon}
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG icons                                                          */
/* ------------------------------------------------------------------ */

const Icons = {
  calendar: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  chart: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  globe: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  wind: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  ),
  target: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  dollar: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  thermometer: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  ),
  droplet: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  clock: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  eye: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  monitor: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  trendUp: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Hero section                                                       */
/* ------------------------------------------------------------------ */

export function HeroSection({
  siteName,
  realtimeVisitors,
  status,
  todayHigh,
  todayLow,
}: {
  siteName: string;
  realtimeVisitors: number;
  status: string;
  todayHigh: number;
  todayLow: number;
}) {
  return (
    <div className="text-center pt-10 pb-6">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase">
        My Website
      </p>
      <h1 className="text-[34px] font-light text-white mt-0.5 leading-tight">
        {siteName}
      </h1>
      <p className="text-[86px] font-extralight text-white leading-none mt-0.5 tracking-tight">
        {formatNumber(realtimeVisitors)}
      </p>
      <p className="text-[17px] text-white/90 font-medium -mt-1">{status}</p>
      <p className="text-[17px] text-white/80 mt-0.5">
        H:{formatNumber(todayHigh)}&nbsp;&nbsp;L:{formatNumber(todayLow)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hourly forecast strip                                              */
/* ------------------------------------------------------------------ */

export function HourlyStrip({
  data,
  summary,
}: {
  data: TimeseriesPoint[];
  summary: string;
}) {
  const maxVisitors = Math.max(...data.map((d) => d.visitors), 1);

  return (
    <Card>
      <p className="text-[13px] text-white/80 border-b border-white/15 pb-2.5 mb-2.5 leading-snug">
        {summary}
      </p>
      <div className="flex overflow-x-auto gap-6 pb-1 scrollbar-hide">
        {data.map((point, i) => {
          const hour = new Date(point.timestamp);
          const h = hour.getUTCHours();
          const label =
            i === 0
              ? "Now"
              : h === 0
                ? "12AM"
                : h < 12
                  ? `${h}AM`
                  : h === 12
                    ? "12PM"
                    : `${h - 12}PM`;

          const intensity = point.visitors / maxVisitors;
          const barColor =
            intensity > 0.7
              ? "bg-yellow-300"
              : intensity > 0.4
                ? "bg-yellow-200/80"
                : "bg-white/50";

          return (
            <div
              key={point.timestamp}
              className="flex flex-col items-center gap-1.5 min-w-[42px]"
            >
              <span className="text-[11px] font-semibold text-white/80">
                {label}
              </span>
              <div className="relative w-[3px] h-[28px] rounded-full bg-white/15">
                <div
                  className={`absolute bottom-0 w-full rounded-full ${barColor}`}
                  style={{ height: `${Math.max(12, intensity * 100)}%` }}
                />
              </div>
              <span className="text-[13px] font-medium text-white">
                {point.visitors}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  10-Day forecast                                                    */
/* ------------------------------------------------------------------ */

export function TenDayForecast({
  data,
  forecast,
}: {
  data: TimeseriesPoint[];
  forecast: ForecastPoint[];
}) {
  const combined = [
    ...data.slice(-7).map((d) => ({
      name: d.name,
      visitors: d.visitors,
      isForecast: false,
    })),
    ...forecast.slice(0, 3).map((d) => ({
      name: d.name,
      visitors: d.visitors,
      isForecast: true,
    })),
  ];

  const allVisitors = combined.map((d) => d.visitors);
  const globalMin = Math.min(...allVisitors);
  const globalMax = Math.max(...allVisitors, 1);
  const range = globalMax - globalMin || 1;

  return (
    <Card label="10-Day Forecast" icon={Icons.calendar} className="h-full">
      <div className="space-y-0">
        {combined.map((day, i) => {
          const low = Math.round(day.visitors * 0.55);
          const leftPct = ((low - globalMin) / range) * 50 + 5;
          const barWidth =
            Math.max(8, ((day.visitors - low) / range) * 55 + 10);

          return (
            <div
              key={i}
              className={`flex items-center gap-2 py-[9px] ${i < combined.length - 1 ? "border-b border-white/10" : ""} ${day.isForecast ? "opacity-50" : ""}`}
            >
              <span className="text-[13px] font-medium text-white w-[38px]">
                {i === 0 && !day.isForecast ? "Today" : day.name}
              </span>
              <span className="text-[13px] text-white/40 w-[32px] text-right tabular-nums">
                {formatNumber(low)}
              </span>
              <div className="flex-1 h-[4px] rounded-full bg-white/10 relative mx-1">
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${leftPct}%`,
                    width: `${barWidth}%`,
                    background:
                      "linear-gradient(90deg, #fbbf24, #f97316, #ef4444)",
                  }}
                />
              </div>
              <span className="text-[13px] font-medium text-white w-[32px] text-right tabular-nums">
                {formatNumber(day.visitors)}
              </span>
              {day.isForecast && (
                <span className="text-[8px] text-cyan-300/60 font-bold tracking-wide">
                  AI
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Bounce Rate (Air Quality)                                          */
/* ------------------------------------------------------------------ */

export function BounceRateCard({ bounceRate }: { bounceRate: number }) {
  const label = getBounceRateLabel(bounceRate);
  const normalized = Math.min(bounceRate / 100, 1);

  return (
    <Card label="Bounce Rate" icon={Icons.chart}>
      <p className="text-[28px] font-semibold text-white leading-none">
        {bounceRate.toFixed(1)}%
      </p>
      <p className="text-[15px] font-medium text-white mt-1">{label}</p>
      <div
        className="w-full h-[5px] rounded-full mt-3 mb-1.5 overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, #22c55e, #84cc16, #eab308, #f97316, #ef4444, #7c2d12)",
        }}
      >
        <div className="relative h-full w-full">
          <div
            className="absolute top-1/2 w-[10px] h-[10px] rounded-full bg-white shadow-sm shadow-black/30"
            style={{
              left: `${normalized * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </div>
      <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
        Bounce rate is {bounceRate.toFixed(1)}%, which is{" "}
        {bounceRate < 50
          ? "below average — visitors are engaged."
          : "above average — consider improving engagement."}
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Countries (Precipitation)                                          */
/* ------------------------------------------------------------------ */

interface CountryData {
  country: string;
  image?: string;
  visitors: number;
  revenue: number;
}

export function CountriesCard({ countries }: { countries: CountryData[] }) {
  const topCountry = countries[0];
  const total = countries.reduce((s, c) => s + c.visitors, 0);

  return (
    <Card label="Top Countries" icon={Icons.globe} className="h-full">
      <div className="space-y-2.5">
        {countries.slice(0, 5).map((c, i) => {
          const pct = total > 0 ? (c.visitors / total) * 100 : 0;
          return (
            <div key={i} className="flex items-center gap-2">
              {c.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.country}
                  className="w-[20px] h-[14px] rounded-[2px] object-cover"
                />
              )}
              <span className="text-[12px] text-white/90 flex-1 truncate">
                {c.country}
              </span>
              <div className="w-[50px] h-[3px] rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400/80"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-white/60 w-[40px] text-right font-medium tabular-nums">
                {formatNumber(c.visitors)}
              </span>
            </div>
          );
        })}
      </div>
      {topCountry && (
        <p className="text-[11px] text-white/50 mt-3 leading-relaxed">
          Most traffic comes from {topCountry.country} with{" "}
          {formatNumber(topCountry.visitors)} visitors.
        </p>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Referrers / Traffic Sources (Wind)                                 */
/* ------------------------------------------------------------------ */

interface ReferrerData {
  referrer: string;
  visitors: number;
  revenue: number;
}

export function ReferrersCard({ referrers }: { referrers: ReferrerData[] }) {
  const top = referrers[0];
  const total = referrers.reduce((s, r) => s + r.visitors, 0);

  return (
    <Card label="Traffic Sources" icon={Icons.wind}>
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1.5">
          {top && (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] text-white/50">Top</span>
                <span className="text-[14px] font-medium text-white">
                  {top.referrer}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] text-white/50">Visitors</span>
                <span className="text-[14px] font-medium text-white">
                  {formatNumber(top.visitors)}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] text-white/50">Revenue</span>
                <span className="text-[14px] font-medium text-white">
                  {formatCurrency(top.revenue)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Compass-style traffic source visualization */}
        <div className="relative w-[90px] h-[90px] shrink-0">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-[8px] rounded-full border border-white/10" />
          <div className="absolute inset-[16px] rounded-full border border-white/5" />
          {referrers.slice(0, 5).map((ref, i) => {
            const angle = (i * 72 - 90) * (Math.PI / 180);
            const pct = total > 0 ? ref.visitors / total : 0;
            const radius = 22 + pct * 18;
            const x = 45 + Math.cos(angle) * radius;
            const y = 45 + Math.sin(angle) * radius;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${4 + pct * 6}px`,
                  height: `${4 + pct * 6}px`,
                  transform: "translate(-50%, -50%)",
                  opacity: 0.4 + pct * 0.6,
                }}
              />
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white/80">
              {formatNumber(total)}
            </span>
          </div>
          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/40 font-bold">
            N
          </span>
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/40 font-bold">
            S
          </span>
          <span className="absolute top-1/2 -left-0.5 -translate-y-1/2 text-[8px] text-white/40 font-bold">
            W
          </span>
          <span className="absolute top-1/2 -right-0.5 -translate-y-1/2 text-[8px] text-white/40 font-bold">
            E
          </span>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Conversion Rate (UV Index)                                         */
/* ------------------------------------------------------------------ */

export function ConversionCard({ rate }: { rate: number }) {
  const label = getConversionLabel(rate);
  const normalized = Math.min(rate / 8, 1);

  return (
    <Card label="Conversion Rate" icon={Icons.target}>
      <p className="text-[28px] font-semibold text-white leading-none">
        {rate.toFixed(2)}%
      </p>
      <p className="text-[14px] font-medium text-white mt-0.5">{label}</p>
      <div
        className="w-full h-[5px] rounded-full mt-2.5 overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, #22c55e, #84cc16, #eab308, #f97316, #dc2626)",
        }}
      >
        <div className="relative h-full w-full">
          <div
            className="absolute top-1/2 w-[10px] h-[10px] rounded-full bg-white shadow-sm shadow-black/30"
            style={{
              left: `${normalized * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue (Sunset)                                                   */
/* ------------------------------------------------------------------ */

export function RevenueCard({
  todayRevenue,
  yesterdayRevenue,
  currency,
}: {
  todayRevenue: number;
  yesterdayRevenue: number;
  currency: string;
}) {
  return (
    <Card label="Revenue" icon={Icons.dollar}>
      <p className="text-[28px] font-light text-white leading-none">
        {formatCurrency(todayRevenue, currency)}
      </p>
      <p className="text-[13px] text-white/60 font-medium mt-1">Today</p>
      <div className="border-t border-white/10 mt-2.5 pt-2">
        <p className="text-[12px] text-white/50">
          Yesterday: {formatCurrency(yesterdayRevenue, currency)}
        </p>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue Per Visitor (Feels Like)                                   */
/* ------------------------------------------------------------------ */

export function RPVCard({ rpv, currency }: { rpv: number; currency: string }) {
  return (
    <Card label="Rev / Visitor" icon={Icons.thermometer}>
      <p className="text-[28px] font-semibold text-white leading-none">
        {currency}
        {rpv.toFixed(2)}
      </p>
      <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
        {rpv > 2
          ? "Visitors are converting well into revenue."
          : "Each visitor brings modest revenue on average."}
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Sessions (Precipitation)                                           */
/* ------------------------------------------------------------------ */

export function SessionsCard({
  sessions,
  sessionsTrend,
}: {
  sessions: number;
  sessionsTrend: string;
}) {
  return (
    <Card label="Sessions" icon={Icons.droplet}>
      <p className="text-[28px] font-semibold text-white leading-none">
        {formatNumber(sessions)}
      </p>
      <p className="text-[13px] font-medium text-white/60 mt-1">Today</p>
      <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
        {sessionsTrend}
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Avg Session Duration (Humidity)                                    */
/* ------------------------------------------------------------------ */

export function DurationCard({ durationMs }: { durationMs: number }) {
  return (
    <Card label="Avg Duration" icon={Icons.clock}>
      <p className="text-[28px] font-semibold text-white leading-none">
        {formatDuration(durationMs)}
      </p>
      <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
        {durationMs > 180000
          ? "Visitors are spending quality time on your site."
          : "Sessions are quick — consider deeper content."}
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Top Page (Visibility)                                              */
/* ------------------------------------------------------------------ */

interface PageData {
  hostname?: string;
  path: string;
  visitors: number;
  revenue: number;
}

export function TopPageCard({ pages }: { pages: PageData[] }) {
  return (
    <Card label="Top Pages" icon={Icons.eye}>
      <div className="space-y-2">
        {pages.slice(0, 4).map((p, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-[12px] text-white truncate flex-1 font-medium">
              {p.path}
            </span>
            <span className="text-[11px] text-white/50 font-medium tabular-nums">
              {formatNumber(p.visitors)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Devices (Pressure)                                                 */
/* ------------------------------------------------------------------ */

interface DeviceData {
  device: string;
  visitors: number;
  revenue: number;
}

export function DevicesCard({ devices }: { devices: DeviceData[] }) {
  const total = devices.reduce((s, d) => s + d.visitors, 0);

  return (
    <Card label="Devices" icon={Icons.monitor}>
      <div className="space-y-2.5">
        {devices.map((d, i) => {
          const pct =
            total > 0 ? ((d.visitors / total) * 100).toFixed(1) : "0";
          return (
            <div key={i}>
              <div className="flex justify-between text-[12px] mb-1">
                <span className="text-white/80 capitalize">{d.device}</span>
                <span className="text-white font-semibold tabular-nums">
                  {pct}%
                </span>
              </div>
              <div className="w-full h-[3px] rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/50"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Week Comparison (Averages)                                         */
/* ------------------------------------------------------------------ */

export function ComparisonCard({
  thisWeekVisitors,
  lastWeekVisitors,
  thisWeekRevenue,
  lastWeekRevenue,
  currency,
}: {
  thisWeekVisitors: number;
  lastWeekVisitors: number;
  thisWeekRevenue: number;
  lastWeekRevenue: number;
  currency: string;
}) {
  const visitorChange =
    lastWeekVisitors > 0
      ? (
          ((thisWeekVisitors - lastWeekVisitors) / lastWeekVisitors) *
          100
        ).toFixed(1)
      : "N/A";
  const revenueChange =
    lastWeekRevenue > 0
      ? (
          ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) *
          100
        ).toFixed(1)
      : "N/A";
  const visitorUp = thisWeekVisitors >= lastWeekVisitors;
  const revenueUp = thisWeekRevenue >= lastWeekRevenue;

  return (
    <Card label="Week over Week" icon={Icons.trendUp}>
      <div className="flex gap-6">
        <div className="flex-1">
          <p className="text-[10px] text-white/50 uppercase tracking-wide mb-0.5">
            Visitors
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold text-white">
              {formatNumber(thisWeekVisitors)}
            </span>
            {visitorChange !== "N/A" && (
              <span
                className={`text-[13px] font-medium ${visitorUp ? "text-green-400" : "text-red-400"}`}
              >
                {visitorUp ? "+" : ""}
                {visitorChange}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/40 mt-0.5">
            Last week: {formatNumber(lastWeekVisitors)}
          </p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex-1">
          <p className="text-[10px] text-white/50 uppercase tracking-wide mb-0.5">
            Revenue
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold text-white">
              {formatCurrency(thisWeekRevenue, currency)}
            </span>
            {revenueChange !== "N/A" && (
              <span
                className={`text-[13px] font-medium ${revenueUp ? "text-green-400" : "text-red-400"}`}
              >
                {revenueUp ? "+" : ""}
                {revenueChange}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/40 mt-0.5">
            Last week: {formatCurrency(lastWeekRevenue, currency)}
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Browsers card (Moon Phase style)                                   */
/* ------------------------------------------------------------------ */

interface BrowserData {
  browser: string;
  visitors: number;
  revenue: number;
}

export function BrowsersCard({ browsers }: { browsers: BrowserData[] }) {
  const total = browsers.reduce((s, b) => s + b.visitors, 0);

  return (
    <Card label="Browsers" icon={Icons.globe}>
      <div className="space-y-2">
        {browsers.slice(0, 4).map((b, i) => {
          const pct =
            total > 0 ? ((b.visitors / total) * 100).toFixed(1) : "0";
          return (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[12px] text-white/80 flex-1 truncate">
                {b.browser}
              </span>
              <span className="text-[10px] text-white/40 font-medium tabular-nums">
                {pct}%
              </span>
              <span className="text-[11px] text-white/60 font-semibold w-[36px] text-right tabular-nums">
                {formatNumber(b.visitors)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
