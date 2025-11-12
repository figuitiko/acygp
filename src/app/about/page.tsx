import { HeroAbout } from "@/components/about/hero-about";
import { SectionInfoAbout } from "@/components/about/section-info";
import { TeamSection } from "@/components/about/team-section";
import React from "react";
import { SECTION_INFO_1, SECTION_INFO_2 } from "./constants";
import { MainWrapper } from "@/components/share/main-wrapper";

const AboutPage = () => {
  return (
    <MainWrapper>
      <HeroAbout
        title="Acerca de nosotro(a)s"
        subTitle="Somos ACYGP SA DE CV, Entidad de Certificación y Evaluación de Competencias."
        description={
          <>
            Acreditada por el <strong>CONOCER</strong>, para capacitar, evaluar
            y/o certificar las competencias laborales de las personas, con base
            en Estándares de Competencia, inscritos en el Registro Nacional de
            Estándar de Competencia, así como acreditar, previa autorización del
            CONOCER, Centros de Evaluación y/o Evaluadores Independientes, en
            uno o varios Estándares de Competencia, inscritos en el Registro
            Nacional de Estándares de Competencia en un periodo determinado.  El
            CONOCER cuenta con  más de 1,100 estándares de competencia laboral,
            los cuales se dividen por sector productivo y pueden ser consultados
            en la página 
            <a className="font-semibold" href="http://www.conocer.gob.mx/">
              http://www.conocer.gob.mx/
            </a>
          </>
        }
        imgSrc="/images/about/hero-about.webp"
      />
      <section className="flex flex-col gap-1 my-16">
        <SectionInfoAbout
          heading={SECTION_INFO_1.heading}
          topics={SECTION_INFO_1.topics}
        />

        <SectionInfoAbout
          showCTA
          heading={SECTION_INFO_2.heading}
          topics={SECTION_INFO_2.topics}
          headingCTA={SECTION_INFO_2.CTA.headingCTA}
          itemsCTA={SECTION_INFO_2.CTA.itemsCTA}
        />
      </section>
      <TeamSection />
    </MainWrapper>
  );
};

export default AboutPage;
