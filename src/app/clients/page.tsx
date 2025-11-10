import { ClientBox } from "@/components/clients/client-box";
import { CLIENTS } from "./constants";
import { MainWrapperSpacer } from "@/components/share/main-wrapper-spacer";
import { HeroClients } from "@/components/clients/hero-clients";

const ClientsPage = () => {
  return (
    <MainWrapperSpacer>
      <HeroClients title="Nuestros Clientes" />
      <section className="flex flex-col gap-12 mt-12">
        <div className="flex flex-col gap-4">
          {CLIENTS.map((item) => (
            <ClientBox key={item.clientName} {...item} />
          ))}
        </div>
      </section>
    </MainWrapperSpacer>
  );
};

export default ClientsPage;
