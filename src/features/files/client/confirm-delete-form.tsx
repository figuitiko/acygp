"use client";

import { useId, useState } from "react";

import { SubmitButton } from "@/features/admin/submit-button";

type ConfirmDeleteFormProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
};

export function ConfirmDeleteForm({
  triggerLabel,
  title,
  description,
  confirmLabel,
  pendingLabel,
  action,
  hiddenFields,
}: ConfirmDeleteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
      >
        {triggerLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">Confirmar acción</p>
            <h3 id={titleId} className="mt-2 text-2xl font-bold text-slate-950">
              {title}
            </h3>
            <p className="mt-3 text-slate-600">{description}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <form action={action}>
                {Object.entries(hiddenFields).map(([fieldName, fieldValue]) => (
                  <input key={fieldName} type="hidden" name={fieldName} value={fieldValue} />
                ))}
                <SubmitButton
                  className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
                  pendingLabel={pendingLabel}
                >
                  {confirmLabel}
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
