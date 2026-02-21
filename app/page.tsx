"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=86400;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;path=/;max-age=0`;
}

const STORAGE_KEY = "datafast-api-key";
const subscribe = () => () => {};
const getSnapshot = () => sessionStorage.getItem(STORAGE_KEY) ?? "";
const getServerSnapshot = () => "";

export default function HomePage() {
  const router = useRouter();
  const storedKey = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [apiKey, setApiKey] = useState(storedKey);

  const handleStart = useCallback(() => {
    if (!apiKey.trim()) return;
    sessionStorage.setItem("datafast-api-key", apiKey.trim());
    setCookie("datafast-api-key", apiKey.trim());
    router.push("/weather");
  }, [apiKey, router]);

  const handleDemo = useCallback(() => {
    sessionStorage.removeItem("datafast-api-key");
    deleteCookie("datafast-api-key");
    router.push("/weather");
  }, [router]);

  return (
    <div className="homepage">
      {/* Background layers */}
      <div className="homepage-bg" />
      <div className="homepage-overlay" />

      {/* Rain effect */}
      <RainEffect />

      {/* Lightning flash */}
      <div className="lightning" />

      {/* Content */}
      <div className="homepage-content">
        <header className="homepage-header">
          <div className="radar-badge">
            <span className="radar-dot" />
            <span className="radar-label">LIVE RADAR</span>
            <span className="radar-dot" />
          </div>

          <h1 className="homepage-title">DATAFORECAST</h1>

          <p className="homepage-subtitle">
            Your website&rsquo;s analytics, delivered as a weather report.
            <br />
            Every metric tells a forecast.
          </p>
        </header>

        <div className="homepage-form">
          <input
            type="text"
            className="homepage-input"
            placeholder="Paste your DataFa.st API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            spellCheck={false}
            autoComplete="off"
          />

          <button
            className="homepage-cta"
            onClick={handleStart}
            disabled={!apiKey.trim()}
          >
            Check the forecast
            <span className="cta-arrow">&rarr;</span>
          </button>

          <div className="homepage-divider">
            <span className="divider-line" />
            <span className="divider-text">or</span>
            <span className="divider-line" />
          </div>

          <button className="homepage-demo" onClick={handleDemo}>
            Try the demo
          </button>
        </div>

        <section className="homepage-steps">
          <h2 className="steps-label">HOW IT WORKS</h2>

          <div className="step">
            <span className="step-number">1</span>
            <div>
              <strong>Get your API key</strong>
              <p>
                Go to your{" "}
                <a
                  href="https://datafa.st"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DataFa.st dashboard
                </a>
                , website settings, then API tab.
              </p>
            </div>
          </div>

          <div className="step">
            <span className="step-number">2</span>
            <div>
              <strong>Paste it above</strong>
              <p>Enter your key and check the forecast.</p>
            </div>
          </div>

          <div className="step">
            <span className="step-number">3</span>
            <div>
              <strong>Read the weather</strong>
              <p>
                Every analytics metric becomes a weather pattern — visitors are
                temperature, bounce rate is humidity, traffic trends are
                forecasts.
              </p>
            </div>
          </div>
        </section>

        <footer className="homepage-footer">
          powered by{" "}
          <a
            href="https://datafa.st"
            target="_blank"
            rel="noopener noreferrer"
          >
            DataFa.st
          </a>
        </footer>
      </div>
    </div>
  );
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const RAIN_DROPS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: seededRandom(i * 4) * 100,
  delay: seededRandom(i * 4 + 1) * 2,
  duration: 0.6 + seededRandom(i * 4 + 2) * 0.4,
  opacity: 0.15 + seededRandom(i * 4 + 3) * 0.25,
}));

function RainEffect() {
  return (
    <div className="rain-container" aria-hidden="true">
      {RAIN_DROPS.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
}
