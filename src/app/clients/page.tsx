import { ClientBox } from "@/components/clients/client-box";
import { CLIENTS } from "./constants";
import { MainWrapperSpacer } from "@/components/share/main-wrapper-spacer";
import { HeroClients } from "@/components/clients/hero-clients";

const ClientsPage = () => {
  return (
    <MainWrapperSpacer>
      <HeroClients title="Nuestros Clientes" />
    </MainWrapperSpacer>
  );
};

export default ClientsPage;
