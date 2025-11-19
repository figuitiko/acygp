import Image from "next/image";

type Props = {
  heading: string;
  imgUrl: string;
};
export const HeroServices = ({ heading, imgUrl }: Props) => {
  return (
    <section className="flex flex-col items-center justify-center  p-4  w-full mx-auto">
      <h1 className="text-main text-5xl font-bold text-center">{heading}</h1>
      <picture className="object-contain max-w-[1061px] w-full h-[235px] md:h-[470px] mt-6 mx-auto rounded-lg shadow-lg">
        <Image
          className="w-full h-full"
          src={imgUrl}
          alt="Hero Image"
          width={1061}
          height={470}
          objectFit="contain"
        />
      </picture>
    </section>
  );
};
