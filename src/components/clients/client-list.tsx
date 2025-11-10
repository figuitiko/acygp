import { CLIENTS } from "@/app/clients/constants";
import React from "react";
import { ClientBox } from "./client-box";

export const ClientList = () => {
  return (
    <section className="flex flex-col gap-12 mt-12">
      <div className="flex flex-col gap-4">
        {CLIENTS.map((item) => (
          <ClientBox key={item.clientName} {...item} />
        ))}
      </div>
    </section>
  );
};
