export interface TimeseriesPoint {
  visitors: number;
  sessions?: number;
  revenue?: number;
  conversion_rate?: number;
  name: string;
  timestamp: string;
}

export interface ForecastPoint {
  name: string;
  visitors: number;
  revenue: number;
  isForecast: boolean;
  timestamp: string;
}

export function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function generateForecast(
  dailyData: TimeseriesPoint[],
  daysToForecast: number = 7
): ForecastPoint[] {
  const recent = dailyData.slice(-14);

  const visitorValues = recent.map((d) => d.visitors);
  const revenueValues = recent.map((d) => d.revenue ?? 0);

  const visitorReg = linearRegression(visitorValues);
  const revenueReg = linearRegression(revenueValues);

  const lastDate = new Date(recent[recent.length - 1]?.timestamp || new Date());
  const n = recent.length;

  const forecast: ForecastPoint[] = [];
  for (let i = 1; i <= daysToForecast; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = dayNames[date.getDay()];

    forecast.push({
      name: dayName,
      visitors: Math.max(0, Math.round(visitorReg.intercept + visitorReg.slope * (n + i - 1))),
      revenue: Math.max(0, Math.round(revenueReg.intercept + revenueReg.slope * (n + i - 1))),
      isForecast: true,
      timestamp: date.toISOString(),
    });
  }

  return forecast;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function formatCurrency(n: number, currency: string = "$"): string {
  if (n >= 1_000_000) return currency + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return currency + (n / 1_000).toFixed(1) + "K";
  return currency + n.toLocaleString();
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}h ${remainMinutes}m`;
}

export function getTrafficStatus(hourlyData: TimeseriesPoint[]): string {
  if (!hourlyData || hourlyData.length < 4) return "Gathering Data";

  const recent = hourlyData.slice(-6);
  const earlier = hourlyData.slice(-12, -6);

  const recentAvg = recent.reduce((s, d) => s + d.visitors, 0) / recent.length;
  const earlierAvg = earlier.length > 0
    ? earlier.reduce((s, d) => s + d.visitors, 0) / earlier.length
    : recentAvg;

  const change = earlierAvg > 0 ? (recentAvg - earlierAvg) / earlierAvg : 0;

  if (change > 0.2) return "Surging Traffic";
  if (change > 0.05) return "Trending Up";
  if (change > -0.05) return "Steady Traffic";
  if (change > -0.2) return "Cooling Down";
  return "Low Activity";
}

export function getBounceRateLabel(rate: number): string {
  if (rate < 30) return "Excellent";
  if (rate < 50) return "Good";
  if (rate < 65) return "Moderate";
  if (rate < 80) return "High";
  return "Very High";
}

export function getConversionLabel(rate: number): string {
  if (rate >= 5) return "Exceptional";
  if (rate >= 3) return "High";
  if (rate >= 1.5) return "Good";
  if (rate >= 0.5) return "Moderate";
  return "Low";
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
