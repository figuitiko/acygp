import Image from "next/image";

type HeroAboutProps = {
  title: string;
  imgSrc: string;
  description: string;
};

export const HeroAbout = ({ title, imgSrc, description }: HeroAboutProps) => {
  return (
    <section className="flex flex-col gap-8 items-center justify-center">
      <h1 className="text-main text-[64px] font-bold">{title}</h1>
      <picture>
        <Image src={imgSrc} alt={title} width={1280} height={570} />
      </picture>
      <p className="text-main text-[36px] font-semibold leading-12 text-center">
        {description}
      </p>
    </section>
  );
};
