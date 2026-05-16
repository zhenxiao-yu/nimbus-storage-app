import type { Metadata } from "next";

import { Hero } from "@/components/marketing/hero";
import { StackMarquee } from "@/components/marketing/stack-marquee";
import { FeaturesBento } from "@/components/marketing/features-bento";
import { Stats } from "@/components/marketing/stats";
import { FAQ } from "@/components/marketing/faq";
import { CTA } from "@/components/marketing/cta";
import { siteConfig } from "@/constants";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.title,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default async function LandingPage() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <StackMarquee />
      <FeaturesBento />
      <Stats />
      <FAQ />
      <CTA isAuthenticated={isAuthenticated} />
    </>
  );
}
