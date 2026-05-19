import { AuthenticatedFloatingChat } from "@/components/chat/authenticated-floating-chat";
import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features, TrustBadges } from "@/components/landing/features";
import { ProductOverview } from "@/components/landing/overview";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FooterCta } from "@/components/landing/footer-cta";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className={theme.page}>
      <LandingHeader />
      <main>
        <Hero />
        <Features />
        <TrustBadges />
        <ProductOverview />
        <Testimonials />
        <Pricing />
        <FooterCta />
      </main>
      <AuthenticatedFloatingChat />
    </div>
  );
}
