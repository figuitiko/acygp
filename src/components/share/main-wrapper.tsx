import React from "react";

type MainWrapperProps = {
  children: React.ReactNode;
};
export const MainWrapper = ({ children }: MainWrapperProps) => {
  return (
    <main className="flex flex-col min-h-[calc(100vh-220px)]">{children}</main>
  );
};
