import { ClientBox } from "@/components/clients/client-box";
import { FEATURED_CLIENTS, ADDITIONAL_CLIENTS } from "./constants";
import { MainWrapperSpacer } from "@/components/share/main-wrapper-spacer";
import { HeroClients } from "@/components/clients/hero-clients";

const ClientsPage = () => {
  return (
    <MainWrapperSpacer>
      <HeroClients title="Nuestros clientes" />
      <section className="flex flex-col gap-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURED_CLIENTS.map((name) => (
            <ClientBox key={name} clientName={name} />
          ))}
        </div>
        <div className="bg-main p-8 text-center">
          <p className="text-white font-semibold leading-relaxed">
            {ADDITIONAL_CLIENTS}
          </p>
        </div>
      </section>
    </MainWrapperSpacer>
  );
};

export default ClientsPage;
