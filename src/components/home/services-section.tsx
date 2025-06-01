import React from "react";
import { Button } from "../share/button";

export const ServicesSection = () => {
  return (
    <section className="bg-hero bg-cover bg-center w-full bg-yellow-200 h-[700px] relative">
      <div className="flex justify-end  items-end size-full px-3 lg:px-24 py-3">
        <div className="flex flex-col p-6 bg-white bg-opacity-80  shadow-lg backdrop-blur-md max-w-[700px] pt-6 px-6 pb-12 mb-8">
          <h3 className="uppercase text-main font-semibold text-2xl">
            servicios
          </h3>
          <h2 className="text-main text-[48px]  font-bold leading-[50px]">
            A través de nuestro enfoque personalizado{" "}
          </h2>
          <p className="text-slate-600 text-lg font-normal mt-4">
            Ayudamos a las empresas y organizaciones a mejorar sus procesos,
            cumplir con normativas y desarrollar prácticas responsables que
            favorezcan tanto el crecimiento económico como el respeto al medio
            ambiente. Además, trabajamos en el diseño e implementación de
            campañas de equidad de género, promoviendo entornos igualitarios.
          </p>
          <Button href={"/contacto"} className="max-w-40">
            Contáctenos
          </Button>
        </div>
      </div>
    </section>
  );
};
