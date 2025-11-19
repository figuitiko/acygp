import { AccordionServices } from "@/components/services/accordion-services";

import { ACCORDION_ITEMS, IMAGE_SERVICE_URL } from "./constants";
import { HeroServices } from "@/components/services/hero-services";
import { MainWrapperSpacer } from "@/components/share/main-wrapper-spacer";

const ServicesPage = () => {
  return (
    <MainWrapperSpacer className="gap-4">
      <HeroServices heading="Servicios" imgUrl={IMAGE_SERVICE_URL} />
      <section className="w-full max-w-5xl mx-auto">
        <AccordionServices items={ACCORDION_ITEMS} />
      </section>
    </MainWrapperSpacer>
  );
};

export default ServicesPage;
