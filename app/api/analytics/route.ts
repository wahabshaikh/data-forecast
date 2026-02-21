import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = "https://datafa.st/api/v1/analytics";

async function resolveApiKey(): Promise<string> {
  const jar = await cookies();
  const custom = jar.get("datafast-api-key")?.value;
  if (custom) return custom;
  return process.env.DATAFAST_API_KEY!;
}

async function datafastFetch(
  apiKey: string,
  endpoint: string,
  params?: Record<string, string>
) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    console.error(`Datafast ${endpoint} failed: ${res.status}`);
    return null;
  }
  return res.json();
}

function todayRange(tz: string) {
  const now = new Date();
  const startAt = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split("T")[0];
  const endAt = startAt;
  return { startAt, endAt, timezone: tz };
}

function yesterdayRange(tz: string) {
  const now = new Date();
  const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const d = y.toISOString().split("T")[0];
  return { startAt: d, endAt: d, timezone: tz };
}

function thisWeekRange(tz: string) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1));
  return {
    startAt: monday.toISOString().split("T")[0],
    endAt: now.toISOString().split("T")[0],
    timezone: tz,
  };
}

function lastWeekRange(tz: string) {
  const now = new Date();
  const day = now.getDay();
  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1));
  const lastMonday = new Date(thisMonday.getFullYear(), thisMonday.getMonth(), thisMonday.getDate() - 7);
  const lastSunday = new Date(thisMonday.getFullYear(), thisMonday.getMonth(), thisMonday.getDate() - 1);
  return {
    startAt: lastMonday.toISOString().split("T")[0],
    endAt: lastSunday.toISOString().split("T")[0],
    timezone: tz,
  };
}

export async function GET() {
  const apiKey = await resolveApiKey();
  const tz = "UTC";
  const allFields = "visitors,sessions,revenue,conversion_rate,name";

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

  const [
    realtime,
    hourlyTimeseries,
    dailyTimeseries,
    overviewToday,
    overviewYesterday,
    overviewThisWeek,
    overviewLastWeek,
    countries,
    referrers,
    pages,
    devices,
    browsers,
  ] = await Promise.all([
    datafastFetch(apiKey, "realtime"),
    datafastFetch(apiKey, "timeseries", {
      fields: allFields,
      interval: "hour",
      timezone: tz,
    }),
    datafastFetch(apiKey, "timeseries", {
      fields: allFields,
      interval: "day",
      startAt: thirtyDaysAgo.toISOString().split("T")[0],
      endAt: now.toISOString().split("T")[0],
      timezone: tz,
    }),
    datafastFetch(apiKey, "overview", todayRange(tz)),
    datafastFetch(apiKey, "overview", yesterdayRange(tz)),
    datafastFetch(apiKey, "overview", thisWeekRange(tz)),
    datafastFetch(apiKey, "overview", lastWeekRange(tz)),
    datafastFetch(apiKey, "countries", { limit: "5", timezone: tz }),
    datafastFetch(apiKey, "referrers", { limit: "5", timezone: tz }),
    datafastFetch(apiKey, "pages", { limit: "5", timezone: tz }),
    datafastFetch(apiKey, "devices", { timezone: tz }),
    datafastFetch(apiKey, "browsers", { limit: "5", timezone: tz }),
  ]);

  return NextResponse.json({
    realtime,
    hourlyTimeseries,
    dailyTimeseries,
    overviewToday,
    overviewYesterday,
    overviewThisWeek,
    overviewLastWeek,
    countries,
    referrers,
    pages,
    devices,
    browsers,
  });
}
