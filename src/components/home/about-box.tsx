import Image from "next/image";

type Props = {
  imgSrc: string;
  imgAlt: string;
  title: string;
  subtitle?: string;
  description: React.ReactNode;
  className?: string;
};

export const AboutBox = ({
  imgSrc,
  imgAlt,
  title,
  description,
  subtitle,
}: Props) => {
  return (
    <div className="flex flex-col items-center p-6 gap-4 shadow-md max-w-[513px] bg-main border-2 border-stone-700 text-white text-center">
      <Image
        src={imgSrc}
        alt={imgAlt}
        width={320}
        height={220}
        className="mb-4"
        loading="lazy"
        objectFit="contain"
      />
      <h3 className="text-[40px] leading-10 mb-2 font-bold">{title}</h3>
      {subtitle && <h4 className="text-[20px] font-normal">{subtitle}</h4>}
      {description}
    </div>
  );
};
