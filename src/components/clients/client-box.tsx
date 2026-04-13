import React from "react";

export type ClientBoxProps = {
  clientName: string;
};

export const ClientBox = ({ clientName }: ClientBoxProps) => {
  return (
    <div className="flex items-center justify-center bg-main p-6 text-center">
      <h2 className="text-white font-semibold text-base leading-snug">
        {clientName}
      </h2>
    </div>
  );
};
