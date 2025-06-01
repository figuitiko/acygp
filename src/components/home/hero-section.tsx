import Image from "next/image";
import { Button, VariantButton } from "../share/button";

export const HeroSection = () => {
  return (
    <section className="flex flex-col md:flex-row bg-main">
      <div className="flex flex-col gap-2 justify-center items-start w-full px-8  max-w-full md:max-w-[60%] p-20 text-white ">
        <h3 className="uppercase text-lg font-semibold">CONÓCENOS</h3>
        <h1 className="text-5xl font-bold leading-[60px]">
          Consultoría Integral en Gestión Laboral y Ambiental
        </h1>
        <p className="text-lg font-light leading-6">
          Ofrecemos una consultoría profesional y comprometida con la
          implementación integral de las obligaciones laborales en las empresas.
          A través de desarrollo normativo, asesoría, capacitación y alianzas
          estratégicas. ¡Conozca nuestros servicios y permítanos ayudar a su
          empresa a crecer de manera responsable y sostenible!
        </p>
        <Button
          href={"/contacto"}
          className="mt-4"
          variant={VariantButton.secondary}
        >
          Contáctenos
        </Button>
      </div>
      <div className="flex flex-col justify-center items-start w-full px-8  max-w-full md:max-w-[40%]">
        <picture className="min-w-[300px] min-h-[300px] w-full h-auto">
          <Image
            src={"/images/hero-img.png"}
            alt="Hero Image"
            width={800}
            height={600}
            className="w-full h-auto object-cover"
          />
          {/* The image should be responsive and cover the section */}
        </picture>
      </div>
    </section>
  );
};
