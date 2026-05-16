"use client";

import { useEffect, useState } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { readConsent } from "@/components/CookieConsent";

export default function Analytics() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const consent = readConsent();
      setAnalyticsAllowed(!!consent?.analytics);
    };
    refresh();
    window.addEventListener("nimbus-consent-change", refresh);
    return () => window.removeEventListener("nimbus-consent-change", refresh);
  }, []);

  if (!analyticsAllowed) return null;

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
