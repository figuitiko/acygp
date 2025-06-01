import { LogoBox } from "./logo-box";
import { Navbar } from "./navbar";

export const Header = () => {
  return (
    <header className="flex max-h-[80px] px-3 lg:px-24 py-3 sticky top-0 z-50   border-b border-gray-200 shadow-sm flex-row items-center justify-between bg-main">
      <LogoBox />
      <Navbar />
    </header>
  );
};
