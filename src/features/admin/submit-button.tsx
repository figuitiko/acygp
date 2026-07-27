"use client";

import { useFormStatus } from "react-dom";

import { createSubmitButtonLabel } from "./submit-button-label";

type SubmitButtonProps = {
  children: string;
  pendingLabel?: string;
  className: string;
  disabledClassName?: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  className,
  disabledClassName = "disabled:cursor-not-allowed disabled:opacity-60",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${className} ${disabledClassName}`}
    >
      {createSubmitButtonLabel({ children, pending, pendingLabel })}
    </button>
  );
}
