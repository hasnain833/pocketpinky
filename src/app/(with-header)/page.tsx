import { HeroSection } from "@/components/HeroSection";
import { AuthorityStrip } from "@/components/AuthorityStrip";
import { WhoSection } from "@/components/WhoSection";
import { ModesSection } from "@/components/ModesSection";
import { UnlockSection } from "@/components/UnlockSection";
import { VoiceSection } from "@/components/VoiceSection";
import { CreatorSection } from "@/components/CreatorSection";
import { PricingSection } from "@/components/PricingSection";
import { MethodSection } from "@/components/MethodSection";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      <HeroSection />
      <PricingSection />

      <ScrollReveal>
        <AuthorityStrip />
      </ScrollReveal>

      <ScrollReveal>
        <WhoSection />
      </ScrollReveal>

      <ScrollReveal>
        <ModesSection />
      </ScrollReveal>

      <ScrollReveal>
        <UnlockSection />
      </ScrollReveal>

      <ScrollReveal>
        <VoiceSection />
      </ScrollReveal>

      <ScrollReveal>
        <CreatorSection />
      </ScrollReveal>

      <ScrollReveal>
        <MethodSection />
      </ScrollReveal>

      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>

      <Footer />
    </div>
  );
}
