import { FEATURED_CLIENTS } from "@/app/clients/constants";
import React from "react";
import { ClientBox } from "./client-box";

export const ClientList = () => {
  return (
    <section className="flex flex-col gap-6 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURED_CLIENTS.map((name) => (
          <ClientBox key={name} clientName={name} />
        ))}
      </div>
    </section>
  );
};
