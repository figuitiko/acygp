import React from "react";
import { ContactForm } from "./contact-form";
import { ArrowContact } from "./arrow-contact";
import Image from "next/image";
import { PhoneIcon } from "./phone-icon";
import { EnvelopeIcon } from "./envelope-icon";

export const HeroContact = () => {
  return (
    <section className="flex flex-col">
      <div className="flex flex-col md:flex-row">
        <ContactForm />
        <div className="relative ">
          <div className="w-0 h-0 border-l-[100px] border-l-transparent border-r-[0px] rotate-180 border-r-transparent border-b-[710px] border-b-slate-200 hidden md:block" />
          <div className="absolute top-20 hidden md:block">
            <ArrowContact />
          </div>
        </div>
        <div className="flex-1 flex  flex-col mt-12 md:mt-32 ">
          <div className="max-w-[458px] flex flex-col gap-6 px-4 ">
            <h1 className="text-main text-[36px] font-bold">
              O CONTÁCTANOS DE FORMA DIRECTA EN:
            </h1>
            <div className="flex gap-4 items-center">
              <PhoneIcon />
              <div className="flex gap-2">
                <a href="tel:+529903363103" className="hover:underline">
                  990 336 3103
                </a>
                /
                <a href="tel:+5224612315233" className="hover:underline">
                  24612315233
                </a>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <EnvelopeIcon />
              <a href="mailto:acygp2025@gmail.com" className="hover:underline">
                acygp2025@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full items-center flex justify-center mt-8 px-16">
        <picture className="max-w-6xl w-full">
          <Image
            src="/images/contact/img-contact.webp"
            alt="Contacto"
            width={800}
            height={400}
            className="w-full h-auto max-w-6xl  object-cover"
          />
        </picture>
      </div>
    </section>
  );
};
