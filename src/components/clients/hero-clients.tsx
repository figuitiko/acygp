import { CLIENTS } from "@/app/clients/constants";
import React from "react";
import { ClientBox } from "./client-box";

export const HeroClients = ({ title }: { title: string }) => {
  return (
    <section className="flex flex-col gap-8 items-center justify-center">
      <h1 className="text-main text-[64px] font-bold">{title}</h1>
      <div className="flex flex-col gap-4">
        {CLIENTS.map((item) => (
          <ClientBox key={item.clientName} {...item} />
        ))}
      </div>
    </section>
  );
};
