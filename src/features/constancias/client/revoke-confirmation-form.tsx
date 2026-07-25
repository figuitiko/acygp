"use client";

import { useId, useState } from "react";

type RevokeConfirmationFormProps = {
  constanciaId: string;
  folio: string;
  recipientName: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function RevokeConfirmationForm({
  constanciaId,
  folio,
  recipientName,
  action,
}: RevokeConfirmationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
      >
        Revocar
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
              ¿Revocar constancia?
            </h3>
            <p className="mt-3 text-slate-600">
              Vas a revocar el folio <strong>{folio}</strong> de <strong>{recipientName}</strong>. La constancia seguirá auditada, pero aparecerá como revocada en la validación pública.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <form action={action}>
                <input type="hidden" name="id" value={constanciaId} />
                <button className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700">
                  Sí, revocar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
