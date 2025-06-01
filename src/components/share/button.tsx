import { cva, VariantProps } from "class-variance-authority";
import Link, { LinkProps } from "next/link";
import React from "react";

export const VariantButton = {
  primary: "primary",
  secondary: "secondary",
} as const;

const buttonStyles = cva(
  "px-4 py-2 font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        [VariantButton.primary]: "bg-main text-white hover:bg-blue-700",
        [VariantButton.secondary]: "bg-gray-200 text-main hover:bg-gray-300",
      },
    },
    defaultVariants: {
      variant: VariantButton.primary,
    },
  }
);

type ButtonOwnProps = VariantProps<typeof buttonStyles> & {
  className?: string;
};

type ButtonProps =
  | (ButtonOwnProps &
      React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
  | (ButtonOwnProps & LinkProps & { href: string });

export const Button = (props: ButtonProps & { children?: React.ReactNode }) => {
  const { variant, className, href, children, ...rest } = props;

  if (href) {
    // Next.js Link
    return (
      <Link
        href={href}
        className={buttonStyles({ variant, className })}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  // Regular button
  return (
    <button
      className={buttonStyles({ variant, className })}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};
