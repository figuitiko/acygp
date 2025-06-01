import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  children: ReactNode;
};

export const IconInfoBox = ({ icon, children }: Props) => {
  return (
    <div className="flex  items-center justify-center gap-2 p-4 text-center text-white">
      {icon}
      {children}
    </div>
  );
};
