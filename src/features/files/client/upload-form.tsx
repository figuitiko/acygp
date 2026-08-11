"use client";

import { SubmitButton } from "@/features/admin/submit-button";

type FolderOption = { id: string; name: string; depth: number };

type UploadFileFormProps = {
  folderOptions: FolderOption[];
  defaultFolderId: string | null;
  action: (formData: FormData) => void | Promise<void>;
};

export function UploadFileForm({ folderOptions, defaultFolderId, action }: UploadFileFormProps) {
  if (folderOptions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
        Creá una carpeta antes de subir archivos.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" encType="multipart/form-data">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Archivo
        <input
          name="file"
          type="file"
          required
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Carpeta
        <select
          name="folderId"
          required
          defaultValue={defaultFolderId ?? folderOptions[0].id}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
        >
          {folderOptions.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {"  ".repeat(folder.depth)}
              {folder.name}
            </option>
          ))}
        </select>
      </label>

      <SubmitButton
        className="rounded-lg bg-main px-4 py-3 font-bold text-white transition hover:bg-blue-800"
        pendingLabel="Subiendo…"
      >
        Subir archivo
      </SubmitButton>
    </form>
  );
}
