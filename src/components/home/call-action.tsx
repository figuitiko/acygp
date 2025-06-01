import { Button } from "../share/button";
import Image from "next/image";

export const CallAction = () => {
  return (
    <section className="flex items-center w-full max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-4  justify-center w-full p-8 text-center">
        <h2 className="text-[48px] font-bold leading-[56px] max-w-[662] text-left">
          ¿Tienes un proyecto en mente o necesitas asesoría para tu
          organización?
        </h2>
        <Button className="max-w-[195px]">Contáctanos</Button>
      </div>
      <picture>
        <Image
          src={"/images/call-action.png"}
          alt="Call to Action"
          width={575}
          height={277}
        />
      </picture>
    </section>
  );
};
