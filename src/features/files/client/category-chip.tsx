"use client";

import { useState } from "react";

import { Check, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";

type CategoryChipProps = {
  href: string;
  categoryId: string;
  name: string;
  fileCount: number;
  isActive: boolean;
  renameAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

const ICON_BUTTON_CLASS =
  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition hover:scale-110";

export function CategoryChip({
  href,
  categoryId,
  name,
  fileCount,
  isActive,
  renameAction,
  deleteAction,
}: CategoryChipProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <form
        action={renameAction}
        className="inline-flex items-center gap-1 rounded-full border-2 border-main bg-white py-1 pl-3 pr-2"
      >
        <input type="hidden" name="id" value={categoryId} />
        <input
          name="name"
          defaultValue={name}
          autoFocus
          required
          onFocus={(event) => event.currentTarget.select()}
          className="w-28 rounded-md px-1 py-1 text-sm font-semibold text-slate-900 outline-none"
        />
        <button
          type="submit"
          aria-label={`Guardar nombre de ${name}`}
          className={`${ICON_BUTTON_CLASS} text-emerald-700 hover:bg-emerald-600 hover:text-white`}
        >
          <Check size={13} />
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          aria-label="Cancelar"
          className={`${ICON_BUTTON_CLASS} text-slate-500 hover:bg-slate-600 hover:text-white`}
        >
          <X size={13} />
        </button>
      </form>
    );
  }

  return (
    <div
      className={[
        "group inline-flex items-center gap-1.5 rounded-full py-2 pl-4 pr-4 text-sm font-bold transition",
        isActive
          ? "bg-main text-white shadow"
          : "border border-slate-300 text-slate-700 hover:border-main hover:text-main",
      ].join(" ")}
    >
      <Link href={href} aria-current={isActive ? "true" : undefined} className="pr-1">
        {name} ({fileCount})
      </Link>
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label={`Renombrar ${name}`}
          className={`${ICON_BUTTON_CLASS} ${isActive ? "hover:bg-white hover:text-main" : "hover:bg-main hover:text-white"}`}
        >
          <Pencil size={13} />
        </button>
        {fileCount === 0 ? (
          <form action={deleteAction}>
            <input type="hidden" name="id" value={categoryId} />
            <button
              type="submit"
              aria-label={`Eliminar ${name}`}
              className={`${ICON_BUTTON_CLASS} ${isActive ? "hover:bg-white hover:text-red-600" : "text-red-600 hover:bg-red-600 hover:text-white"}`}
            >
              <Trash2 size={13} />
            </button>
          </form>
        ) : (
          <span
            title="Reasigná o eliminá sus archivos primero"
            className={`${ICON_BUTTON_CLASS} cursor-not-allowed ${isActive ? "text-white/40" : "text-slate-300"}`}
          >
            <Trash2 size={13} />
          </span>
        )}
      </span>
    </div>
  );
}
