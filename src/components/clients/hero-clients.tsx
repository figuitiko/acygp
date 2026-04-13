import Image from "next/image";
import React from "react";

export const HeroClients = ({ title }: { title: string }) => {
  return (
    <section className="flex flex-col gap-8 items-center justify-center">
      <h1 className="text-main text-[64px] font-bold">{title}</h1>
      <picture className="relative w-full h-[300px] md:h-[400px]">
        <Image
          src="/images/clients/logos-clientes.png"
          alt="hero-clients"
          fill
          className="object-cover"
        />
      </picture>
    </section>
  );
};
