import { headers } from "next/headers";
import {
  getTrafficStatus,
  generateForecast,
  formatNumber,
  type TimeseriesPoint,
} from "./utils";
import {
  HeroSection,
  HourlyStrip,
  TenDayForecast,
  BounceRateCard,
  CountriesCard,
  ReferrersCard,
  ConversionCard,
  RevenueCard,
  RPVCard,
  SessionsCard,
  DurationCard,
  TopPageCard,
  DevicesCard,
  ComparisonCard,
  BrowsersCard,
} from "./components";

async function getAnalyticsData() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/analytics`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch analytics data");
  return res.json();
}

export default async function WeatherDashboard() {
  let data: Record<string, unknown>;
  try {
    data = await getAnalyticsData();
  } catch {
    return (
      <div className="min-h-screen bg-linear-to-b from-sky-400 via-blue-500 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white/80 p-8">
          <p className="text-4xl font-thin mb-4">--</p>
          <p className="text-lg">Unable to load analytics data</p>
          <p className="text-sm mt-2 text-white/50">
            Check your DATAFAST_API_KEY and try again
          </p>
        </div>
      </div>
    );
  }

  const realtime = data.realtime as {
    data?: { visitors: number }[];
  } | null;
  const hourlyTimeseries = data.hourlyTimeseries as {
    data?: TimeseriesPoint[];
    currency?: string;
  } | null;
  const dailyTimeseries = data.dailyTimeseries as {
    data?: TimeseriesPoint[];
    currency?: string;
  } | null;
  const overviewToday = data.overviewToday as {
    data?: Array<Record<string, number | string>>;
  } | null;
  const overviewYesterday = data.overviewYesterday as {
    data?: Array<Record<string, number | string>>;
  } | null;
  const overviewThisWeek = data.overviewThisWeek as {
    data?: Array<Record<string, number | string>>;
  } | null;
  const overviewLastWeek = data.overviewLastWeek as {
    data?: Array<Record<string, number | string>>;
  } | null;
  const countries = data.countries as {
    data?: Array<{
      country: string;
      image?: string;
      visitors: number;
      revenue: number;
    }>;
  } | null;
  const referrers = data.referrers as {
    data?: Array<{ referrer: string; visitors: number; revenue: number }>;
  } | null;
  const pages = data.pages as {
    data?: Array<{
      hostname?: string;
      path: string;
      visitors: number;
      revenue: number;
    }>;
  } | null;
  const devices = data.devices as {
    data?: Array<{ device: string; visitors: number; revenue: number }>;
  } | null;
  const browsers = data.browsers as {
    data?: Array<{ browser: string; visitors: number; revenue: number }>;
  } | null;

  const realtimeVisitors = realtime?.data?.[0]?.visitors ?? 0;
  const hourlyData: TimeseriesPoint[] = hourlyTimeseries?.data ?? [];
  const dailyData: TimeseriesPoint[] = dailyTimeseries?.data ?? [];
  const currency = (hourlyTimeseries?.currency ||
    dailyTimeseries?.currency ||
    "$") as string;

  const todayOverview = overviewToday?.data?.[0] ?? {};
  const yesterdayOverview = overviewYesterday?.data?.[0] ?? {};
  const thisWeekOverview = overviewThisWeek?.data?.[0] ?? {};
  const lastWeekOverview = overviewLastWeek?.data?.[0] ?? {};

  const todayHigh =
    hourlyData.length > 0
      ? Math.max(...hourlyData.map((d) => d.visitors))
      : 0;
  const todayLow =
    hourlyData.length > 0
      ? Math.min(...hourlyData.map((d) => d.visitors))
      : 0;
  const trafficStatus = getTrafficStatus(hourlyData);
  const forecast = generateForecast(dailyData, 7);
  const siteName = pages?.data?.[0]?.hostname || "Your Site";

  const todaySessions = Number(todayOverview.sessions ?? 0);
  const yesterdaySessions = Number(yesterdayOverview.sessions ?? 0);
  const sessionsTrendText =
    todaySessions >= yesterdaySessions
      ? `Up from ${formatNumber(yesterdaySessions)} yesterday.`
      : `Down from ${formatNumber(yesterdaySessions)} yesterday.`;

  const hourlyStripSummary =
    trafficStatus === "Surging Traffic"
      ? "Traffic is surging right now. Visitors are up significantly."
      : trafficStatus === "Trending Up"
        ? "Traffic is picking up. Expect more visitors throughout the day."
        : trafficStatus === "Steady Traffic"
          ? "Steady traffic throughout the day. Patterns look normal."
          : trafficStatus === "Cooling Down"
            ? "Traffic is slowing down compared to earlier."
            : "Low activity period. Traffic may pick up soon.";

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 via-blue-500 to-indigo-800">
      <div className="max-w-[960px] mx-auto px-4 pb-12">
        {/* ---- Hero ---- */}
        <HeroSection
          siteName={siteName}
          realtimeVisitors={realtimeVisitors}
          status={trafficStatus}
          todayHigh={todayHigh}
          todayLow={todayLow}
        />

        {/* ---- Hourly strip ---- */}
        <div className="mb-2.5">
          <HourlyStrip data={hourlyData} summary={hourlyStripSummary} />
        </div>

        {/* ---- 3-column section: 10-Day | Bounce+Referrers | Countries ---- */}
        <div className="grid grid-cols-3 gap-2.5 mb-2.5">
          <div className="row-span-2">
            <TenDayForecast data={dailyData} forecast={forecast} />
          </div>
          <div>
            <BounceRateCard
              bounceRate={Number(todayOverview.bounce_rate ?? 0)}
            />
          </div>
          <div className="row-span-2">
            <CountriesCard countries={countries?.data ?? []} />
          </div>
          <div>
            <ReferrersCard referrers={referrers?.data ?? []} />
          </div>
        </div>

        {/* ---- 4-column small cards row 1 ---- */}
        <div className="grid grid-cols-4 gap-2.5 mb-2.5">
          <ConversionCard
            rate={Number(todayOverview.conversion_rate ?? 0)}
          />
          <RevenueCard
            todayRevenue={Number(todayOverview.revenue ?? 0)}
            yesterdayRevenue={Number(yesterdayOverview.revenue ?? 0)}
            currency={currency}
          />
          <RPVCard
            rpv={Number(todayOverview.revenue_per_visitor ?? 0)}
            currency={currency}
          />
          <SessionsCard
            sessions={todaySessions}
            sessionsTrend={sessionsTrendText}
          />
        </div>

        {/* ---- 4-column small cards row 2 ---- */}
        <div className="grid grid-cols-4 gap-2.5 mb-2.5">
          <BrowsersCard browsers={browsers?.data ?? []} />
          <DurationCard
            durationMs={Number(todayOverview.avg_session_duration ?? 0)}
          />
          <TopPageCard pages={pages?.data ?? []} />
          <DevicesCard devices={devices?.data ?? []} />
        </div>

        {/* ---- Full-width week comparison ---- */}
        <ComparisonCard
          thisWeekVisitors={Number(thisWeekOverview.visitors ?? 0)}
          lastWeekVisitors={Number(lastWeekOverview.visitors ?? 0)}
          thisWeekRevenue={Number(thisWeekOverview.revenue ?? 0)}
          lastWeekRevenue={Number(lastWeekOverview.revenue ?? 0)}
          currency={currency}
        />
      </div>
    </div>
  );
}
