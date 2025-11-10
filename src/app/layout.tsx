import type { Metadata } from "next";

import "./globals.css";
import { firaSans } from "@/ui/fonts";
import { Header } from "@/components/share/header";
import { Footer } from "@/components/share/footer";

export const metadata: Metadata = {
  title: "Acygp consultoria",
  description: "Consultoria especializada en gestion de proyectos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${firaSans.variable} antialiased`}>
        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}
