import { Mail, MapPin, Phone } from "lucide-react";
import { IconInfoBox } from "./icon-info-box";
import { LogoBox } from "./logo-box";
import { Navbar } from "./navbar";

export const Footer = () => {
  return (
    <footer className="flex flex-col bg-main text-white">
      <div className="flex max-h-[80px] px-3 lg:px-24 py-3 shadow-sm flex-row items-center justify-between bg-main">
        <LogoBox />
        <Navbar />
      </div>
      <div className="flex flex-col md:flex-row  items-center justify-center gap-4 p-4 text-sm text-gray-300 z-50">
        <IconInfoBox icon={<Phone />}>
          <div className="flex gap-2">
            <a
              href="tel:+529903363103"
              className="hover:underline"
              target="_blank"
            >
              +52 (990) 336-3103
            </a>
            <span>/</span>
            <a
              href="tel:+522461231523"
              className="hover:underline"
              target="_blank"
            >
              +52 (246) 123-1523
            </a>
          </div>
        </IconInfoBox>
        <IconInfoBox icon={<Mail />}>
          <div>
            <a
              href="mailto:acygp2025@gmail.com"
              className="hover:underline"
              target="_blank"
            >
              acygp2025@gmail.com
            </a>
          </div>
        </IconInfoBox>
        <IconInfoBox icon={<MapPin />}>
          <div>
            <a
              href="https://maps.app.goo.gl/2zaQvTSXGEmhPEqi8"
              className="hover:underline"
              target="_blank"
            >
              Tlaxcala, Tlaxcala.
            </a>
          </div>
        </IconInfoBox>
      </div>
    </footer>
  );
};
