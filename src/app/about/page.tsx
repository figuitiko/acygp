import { HeroAbout } from "@/components/about/hero-about";
import { TeamSection } from "@/components/about/team-section";
import { MainWrapperSpacer } from "@/components/share/main-wrapper-spacer";
import React from "react";

const AboutPage = () => {
  return (
    <MainWrapperSpacer>
      <HeroAbout
        title="Acerca de nosotro(a)s"
        description="Somos consultoría profesional y comprometida con lograr la implementación integral de las obligaciones laborales en las empresas,  a través del desarrollo normativo, de asesoría, de capacitación integral y con el establecimiento de alianzas estratégicas, atender también la Protección al Medio Ambiente."
        imgSrc="/images/about/hero-about.webp"
      />
      <TeamSection />
    </MainWrapperSpacer>
  );
};

export default AboutPage;
