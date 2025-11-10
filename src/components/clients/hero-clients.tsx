import React from "react";

export const HeroClients = ({ title }: { title: string }) => {
  return (
    <section className="flex flex-col gap-8 items-center justify-center">
      <h1 className="text-main text-[64px] font-bold">{title}</h1>
    </section>
  );
};
