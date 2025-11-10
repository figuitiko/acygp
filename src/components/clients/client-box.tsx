import Image from "next/image";
import React from "react";

export type ClientBoxProps = {
  clientName: string;
  clintImgSrc: string;
  isLeft?: boolean;
};

export const ClientBox = ({
  clientName,
  clintImgSrc,
  isLeft = false,
}: ClientBoxProps) => {
  return (
    <div
      className={`flex gap-8 p-4 items-center justify-center  ${
        isLeft && "flex-row-reverse"
      }`}
    >
      <div className="flex items-center justify-center bg-main p-4 max-w-[500px] w-full">
        <h2 className="text-white">{clientName}</h2>
      </div>
      <picture>
        <Image src={clintImgSrc} alt="Client Logo" width={700} height={640} />
      </picture>
    </div>
  );
};
