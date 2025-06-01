import Link from "next/link";
import React from "react";
import Image from "next/image";

export const LogoBox = () => {
  return (
    <div>
      <Link href="/" className="flex items-center gap-2">
        <picture className="flex items-center min-h-16">
          <Image
            src="/logo-acygp.png"
            alt="Logo"
            width={120}
            height={100}
            className="rounded-full"
          />
        </picture>
      </Link>
    </div>
  );
};
