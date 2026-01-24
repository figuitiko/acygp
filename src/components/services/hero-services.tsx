import Image from "next/image";

type Props = {
  heading: string;
  imgUrl: string;
};
export const HeroServices = ({ heading, imgUrl }: Props) => {
  return (
    <section className="flex flex-col items-center justify-center  p-4  w-full mx-auto">
      <h1 className="text-main text-5xl font-bold text-center">{heading}</h1>
      <div className="relative max-w-[1061px] w-full h-[235px] md:h-[470px] mt-6 mx-auto rounded-lg shadow-lg overflow-hidden">
        <Image
          className="object-cover"
          src={imgUrl}
          alt="Hero Image"
          fill
          sizes="(max-width: 768px) 100vw, 1061px"
        />
      </div>
    </section>
  );
};
