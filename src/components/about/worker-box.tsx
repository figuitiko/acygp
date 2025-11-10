import Image from "next/image";

export type WorkerBoxProps = {
  workerName: string;
  workerImgSrc: string;
  workerRole: string;
  workerDescription: string;
};
export const WorkerBox = ({
  workerName,
  workerImgSrc,
  workerRole,
  workerDescription,
}: WorkerBoxProps) => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center p-7 bg-main text-white">
      <picture>
        <Image
          className="rounded-full size-52"
          src={workerImgSrc}
          alt={workerName}
          width={200}
          height={200}
        />
      </picture>
      <div className="flex gap-1 flex-col items-center justify-center w-full">
        <h2 className="text-bold text-xl">{workerName}</h2>
        <h3 className="text-slate-300"> {workerRole}</h3>
        <p className="text-center mt-4">{workerDescription}</p>
      </div>
    </div>
  );
};
