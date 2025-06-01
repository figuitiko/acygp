import React from "react";
import { AboutBox } from "./about-box";
import { Button, VariantButton } from "../share/button";

export const AboutSection = () => {
  return (
    <section className="flex p-2 md:px-20 relative top-0 md:top-[-50px] mb-auto md:-mb-14">
      <div className="flex flex-col items-center justify-center z-20   w-full h-full bg-main max-w-[1200px] mx-auto p-4 md:p-12 text-white gap-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 max-w-[790px]">
          Somos especialistas en consultoría y capacitación, ofertamos:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 place-items-center">
          <AboutBox
            imgSrc="/images/asesoria.png"
            imgAlt="asesoria"
            title="Asesoría"
            subtitle="Este servicio comprende el acompañamiento a un líder de proyecto designado  por la empresa"
            description={
              <p className="text-slate-400">
                A quien se le brindará asesoría especializada para
                el cumplimiento de la normatividad aplicable, el registro y
                cumplimento de la capacitación, así como contar con todas las
                condiciones generales en la contratación y prestaciones del
                personal.
              </p>
            }
          />
          <AboutBox
            imgSrc="/images/desahogo.png"
            imgAlt="desahogo"
            title="Desahogo de inspecciones"
            subtitle="Se brinda cuando una empresa enfrenta una inspección por parte de la autoridad laboral."
            description={
              <p className="text-slate-400">
                Este servicio incluye la respuesta inmediata durante los
                primeros cinco días para entregar los documentos faltantes de la
                inspección y dar respuesta al emplazamiento. El proceso finaliza
                con la inspección de comprobación, si es necesario.
              </p>
            }
          />
          <AboutBox
            imgSrc="/images/capacitacion.jpg"
            imgAlt="capacitacion"
            title="Capacitación"
            subtitle="La capacitación puede ser virtual o presencial en las instalaciones de la empresa o dependencia"
            description={
              <p className="text-slate-400">
                o bien donde la misma determine dependiendo de sus necesidades.
                El horario y fechas de acuerda con el líder del proyecto y
                el facilitador. Contamos con el registro como Agentes
                Capacitadores Externos para entregar las Constancias de
                Habilidades Laborales (DC3)
              </p>
            }
          />
          <AboutBox
            imgSrc="/images/asesoria.png"
            imgAlt="asesoria"
            title="Alianza estratégica para Protección al Medio Ambiente"
            description={
              <ul className="list-disc pl-5 text-left text-slate-400">
                <li>Normatividad de Protección al Medio Ambiente.</li>
                <li>Normatividad y permisos ante CONAGUA.</li>
                <li>Asesoría y cumplimiento PROFEPA.</li>
              </ul>
            }
          />
        </div>
        <div className="flex justify-center">
          <Button variant={VariantButton.secondary}>
            CONOCE A NUESTROS CLIENTES
          </Button>
        </div>
      </div>
    </section>
  );
};
