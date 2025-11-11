"use client";
import { useState } from "react";
import { FacebookIcon } from "./icons/facebook";
import { InstagramIcon } from "./icons/instagram";
import Link from "next/link";

const navbarLinks = [
  { name: "Nosotros", path: "/about" },
  // { name: "Servicios", path: "/servicios" },
  { name: "Clientes", path: "/clients" },
  { name: "Cursos", path: "/courses" },
  { name: "Contacto", path: "/contact" },
] as const;

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-main relative">
      <div className="flex items-center justify-between px-4 py-2">
        <ul className="hidden md:flex gap-6 m-0 p-0 list-none">
          {navbarLinks.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                className="text-white font-semibold text-xl hover:text-slate-400 transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <button
          className="md:hidden flex flex-col gap-1.5 bg-transparent border-0 cursor-pointer"
          aria-label="Open menu"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span className="block w-6 h-0.5 bg-white rounded"></span>
          <span className="block w-6 h-0.5 bg-white rounded"></span>
          <span className="block w-6 h-0.5 bg-white rounded"></span>
        </button>
      </div>
      {/* Mobile menu as a left-side drawer */}
      <div
        className={`
          md:hidden
          fixed top-0 left-0 h-full w-64 z-50
          bg-main border-r border-gray-200
          transition-transform duration-300
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ willChange: "transform" }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <span className="font-semibold text-lg text-white">Menú</span>
          <button
            className="flex flex-col gap-1.5 bg-transparent border-0 cursor-pointer"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="block w-6 h-0.5 bg-white rotate-45 translate-y-1"></span>
            <span className="block w-6 h-0.5 bg-white -rotate-45 -translate-y-1"></span>
          </button>
        </div>
        <ul className="flex flex-col gap-4 px-4 py-4">
          {navbarLinks.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                className="text-white font-semibold text-xl z-50 hover:text-slate-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};
