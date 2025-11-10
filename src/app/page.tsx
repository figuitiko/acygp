import { AboutSection } from "@/components/home/about-section";
import { CallAction } from "@/components/home/call-action";
import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { MainWrapper } from "@/components/share/main-wrapper";

export default function Home() {
  return (
    <MainWrapper>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <CallAction />
    </MainWrapper>
  );
}
