import React from "react";
import { WorkerBox, WorkerBoxProps } from "./worker-box";
import { workersData } from "../../app/about/constants";

export const TeamSection = () => {
  return (
    <section className="flex gap-4 justify-center items-center flex-wrap md:flex-nowrap">
      {workersData.map((worker: WorkerBoxProps) => (
        <WorkerBox
          key={worker.workerName}
          workerName={worker.workerName}
          workerImgSrc={worker.workerImgSrc}
          workerRole={worker.workerRole}
          workerDescription={worker.workerDescription}
        />
      ))}
    </section>
  );
};
