import Image from "next/image";
import { ReactNode } from "react";

type HeroAboutProps = {
  title: string;
  subTitle: string;
  imgSrc: string;
  description: ReactNode;
};

export const HeroAbout = ({
  title,
  subTitle,
  imgSrc,
  description,
}: HeroAboutProps) => {
  return (
    <section className="flex flex-col gap-8 items-center justify-center px-8">
      <h1 className="text-main text-4xl md:text-5xl font-bold">{title}</h1>
      <picture>
        <Image src={imgSrc} alt={title} width={1280} height={570} />
      </picture>

      <h2 className="text-main text-4xl md:text-5xl font-bold max-w-fit">
        {subTitle}
      </h2>
      <p className="text-main text-xl md:text-4xl leading-8 md:leading-[48px] max-w-fit text-center">
        {description}
      </p>
    </section>
  );
};
