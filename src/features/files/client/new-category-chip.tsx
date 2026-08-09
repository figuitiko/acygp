"use client";

import { useState } from "react";

import { Check, Plus, X } from "lucide-react";

type NewCategoryChipProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function NewCategoryChip({ action }: NewCategoryChipProps) {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return (
      <form
        action={action}
        className="inline-flex items-center gap-1 rounded-full border-2 border-main bg-white py-1 pl-3 pr-2"
      >
        <input
          name="name"
          autoFocus
          required
          placeholder="Nombre de la categoría"
          className="w-32 rounded-md px-1 py-1 text-sm font-semibold text-slate-900 outline-none"
        />
        <button
          type="submit"
          aria-label="Crear categoría"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-emerald-700 transition hover:scale-110 hover:bg-emerald-600 hover:text-white"
        >
          <Check size={13} />
        </button>
        <button
          type="button"
          onClick={() => setIsCreating(false)}
          aria-label="Cancelar"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:scale-110 hover:bg-slate-600 hover:text-white"
        >
          <X size={13} />
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsCreating(true)}
      className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-main hover:text-main"
    >
      <Plus size={14} />
      Nueva categoría
    </button>
  );
}
