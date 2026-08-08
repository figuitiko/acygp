"use client";

import { useState } from "react";

import { SubmitButton } from "@/features/admin/submit-button";

type Category = { id: string; name: string };

type UploadFileFormProps = {
  categories: Category[];
  action: (formData: FormData) => void | Promise<void>;
};

export function UploadFileForm({ categories, action }: UploadFileFormProps) {
  const [isCreatingCategory, setIsCreatingCategory] = useState(categories.length === 0);

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

      {isCreatingCategory ? (
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Nueva categoría
          <input
            name="newCategoryName"
            required
            placeholder="Ej. Formularios"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Categoría
          <select
            name="categoryId"
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {categories.length > 0 && (
        <button
          type="button"
          onClick={() => setIsCreatingCategory((current) => !current)}
          className="self-start text-sm font-bold text-main hover:underline"
        >
          {isCreatingCategory ? "Elegir categoría existente" : "+ Nueva categoría"}
        </button>
      )}

      <SubmitButton
        className="rounded-lg bg-main px-4 py-3 font-bold text-white transition hover:bg-blue-800"
        pendingLabel="Subiendo…"
      >
        Subir archivo
      </SubmitButton>
    </form>
  );
}
