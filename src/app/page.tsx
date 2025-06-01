import { AboutSection } from "@/components/home/about-section";
import { CallAction } from "@/components/home/call-action";
import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <CallAction />
    </>
  );
}
