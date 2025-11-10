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
      <div className="flex flex-col md:flex-row  md:items-center md:justify-center gap-4 p-4 text-sm text-gray-300">
        <IconInfoBox icon={<Phone />}>
          <div className="flex gap-2">
            <a
              href="tel:+529512227059"
              className="hover:underline"
              target="_blank"
            >
              +52 (951) 222-7059
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
