import React from "react";

export const MainWrapperSpacer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <main className="flex flex-col max-w-[1280px] mx-auto my-12 gap-16 min-h-[calc(100vh-220px)]">
      {children}
    </main>
  );
};
