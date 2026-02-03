import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";

const QuizSection = dynamic(() => import("@/components/QuizSection").then((m) => ({ default: m.QuizSection })), { ssr: true });
const FeaturesSection = dynamic(() => import("@/components/FeaturesSection").then((m) => ({ default: m.FeaturesSection })), { ssr: true });
const HowItWorksSection = dynamic(() => import("@/components/HowItWorksSection").then((m) => ({ default: m.HowItWorksSection })), { ssr: true });
const BeforeAfterSection = dynamic(() => import("@/components/BeforeAfterSection").then((m) => ({ default: m.BeforeAfterSection })), { ssr: true });
const ChatbotSection = dynamic(() => import("@/components/ChatbotSection").then((m) => ({ default: m.ChatbotSection })), { ssr: true });
const PricingSection = dynamic(() => import("@/components/PricingSection").then((m) => ({ default: m.PricingSection })), { ssr: true });
const TestimonialsSection = dynamic(() => import("@/components/TestimonialsSection").then((m) => ({ default: m.TestimonialsSection })), { ssr: true });
const Footer = dynamic(() => import("@/components/Footer").then((m) => ({ default: m.Footer })), { ssr: true });

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      <Header />
      <HeroSection />
      <TrustBar />
      <QuizSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BeforeAfterSection />
      <ChatbotSection />
      <PricingSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
