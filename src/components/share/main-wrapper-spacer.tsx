import { cn } from "@/util/tailwind";
import React from "react";

export const MainWrapperSpacer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <main
      className={cn(
        "flex flex-col max-w-[1280px] mx-auto my-12 gap-16 min-h-[calc(100vh-220px)]",
        className
      )}
    >
      {children}
    </main>
  );
};
