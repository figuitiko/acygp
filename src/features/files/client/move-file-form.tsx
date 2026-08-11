"use client";

import { useId, useState } from "react";

import { SubmitButton } from "@/features/admin/submit-button";

type FolderOption = { id: string; name: string; depth: number };

type MoveFileFormProps = {
  fileId: string;
  fileName: string;
  currentFolderId: string;
  returnFolderId: string | null;
  folderOptions: FolderOption[];
  action: (formData: FormData) => void | Promise<void>;
};

export function MoveFileForm({
  fileId,
  fileName,
  currentFolderId,
  returnFolderId,
  folderOptions,
  action,
}: MoveFileFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const selectId = `${titleId}-folder`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        Mover
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-main">Mover archivo</p>
            <h3 id={titleId} className="mt-2 text-2xl font-bold text-slate-950">
              {fileName}
            </h3>
            <form action={action} className="mt-4">
              <input type="hidden" name="id" value={fileId} />
              <input type="hidden" name="returnFolderId" value={returnFolderId ?? ""} />
              <label htmlFor={selectId} className="block text-sm font-bold text-slate-700">
                Carpeta destino
              </label>
              <select
                id={selectId}
                name="folderId"
                defaultValue={currentFolderId}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              >
                {folderOptions.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {"  ".repeat(folder.depth)}
                    {folder.name}
                  </option>
                ))}
              </select>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <SubmitButton
                  className="rounded-lg bg-main px-4 py-2 font-bold text-white transition hover:opacity-90"
                  pendingLabel="Moviendo..."
                >
                  Mover
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
