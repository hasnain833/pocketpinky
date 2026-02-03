import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";
import { QuizSection } from "@/components/QuizSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { BeforeAfterSection } from "@/components/BeforeAfterSection";
import { ChatbotSection } from "@/components/ChatbotSection";
import { PricingSection } from "@/components/PricingSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";

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
