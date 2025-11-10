import Image from "next/image";
import React from "react";
type HeroCoursesProps = {
  heading: string;
  headingInfo: string;
  subHeadingInfo: string;
  imgSrc: string;
  descriptionInfo: string;
};
export const HeroCourses = ({
  heading,
  headingInfo,
  subHeadingInfo,
  imgSrc,
  descriptionInfo,
}: HeroCoursesProps) => {
  return (
    <section className="flex flex-col items-center justify-center">
      <h1 className="text-main text-[64px] font-bold">{heading}</h1>
      <div className="flex items-center justify-center gap-16 mt-8">
        <div className="flex flex-col gap-4 max-w-[519px]">
          <h2 className="font-bold text-[36px]">{headingInfo}</h2>
          <h4 className="font-bold text-[24px]">{subHeadingInfo}</h4>
          <p className="text-[16px]">{descriptionInfo}</p>
        </div>
        <picture className="max-w-[624px]">
          <Image src={imgSrc} alt="Courses Hero" width={624} height={480} />
        </picture>
      </div>
    </section>
  );
};
