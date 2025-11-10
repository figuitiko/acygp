"use client";
import {
  sendContactMessage,
  ContactFormState,
} from "@/actions/contact-actions";
import { useActionState, useState } from "react";
import { set, z, ZodError } from "zod";
const initialFormData = {
  name: "",
  email: "",
  message: "",
};

export const ContactForm = () => {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(sendContactMessage, initialFormData);

  const [errorContactFormData, setErrorContactFormData] = useState<
    Partial<typeof initialFormData>
  >({});

  // Check if state is a ZodError
  const isError = state instanceof ZodError;
  const errors = isError
    ? z.treeifyError(state).properties // use .properties to access field errors
    : null;

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const nameSchema = z.string().min(1);
    const emailSchema = z.email();
    const msgSchema = z.string().min(10);
    if (name === "email") {
      // Validate email on change
      const result = emailSchema.safeParse(value);
      if (!result.success) {
        // Handle invalid email (you might want to set an error state here)

        setErrorContactFormData((prev) => ({
          ...prev,
          email: "Correo electrónico inválido",
        }));
      } else {
        setErrorContactFormData((prev) => ({
          ...prev,
          email: undefined,
        }));
      }
    }
    if (name === "name") {
      const result = nameSchema.safeParse(value);
      if (!result.success) {
        setErrorContactFormData((prev) => ({
          ...prev,
          name: "El nombre es obligatorio",
        }));
      } else {
        setErrorContactFormData((prev) => ({
          ...prev,
          name: undefined,
        }));
      }
    }
    if (name === "message") {
      const result = msgSchema.safeParse(value);
      if (!result.success) {
        setErrorContactFormData((prev) => ({
          ...prev,
          message: "El mensaje debe tener al menos 10 caracteres",
        }));
      } else {
        setErrorContactFormData((prev) => ({
          ...prev,
          message: undefined,
        }));
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-main p-8 text-white">
      <form action={formAction} className="flex flex-col gap-4 text-main">
        <fieldset className="flex flex-col">
          <input
            className="placeholder:text-main"
            type="text"
            id="name"
            name="name"
            onChange={handleOnChange}
            placeholder="Nombre"
            defaultValue={!isError ? state.name : ""}
          />
          {(errors?.name || errorContactFormData.name) && (
            <span className="text-red-300 text-sm mt-1">
              {errors?.name?.errors?.[0] || "Nombre inválido"}
              {errorContactFormData.name && errorContactFormData.name}
            </span>
          )}
        </fieldset>

        <fieldset className="flex flex-col">
          <input
            className="placeholder:text-main"
            type="email"
            id="email"
            name="email"
            onChange={handleOnChange}
            placeholder="Correo Electrónico"
            defaultValue={!isError ? state.email : ""}
          />
          {(errors?.email || errorContactFormData.email) && (
            <span className="text-red-300 text-sm mt-1">
              {errors?.email?.errors?.[0] || "Correo electrónico inválido"}
              {errorContactFormData.email && errorContactFormData.email}
            </span>
          )}
        </fieldset>

        <fieldset className="flex flex-col">
          <textarea
            className="placeholder:text-main"
            onChange={handleOnChange}
            id="message"
            name="message"
            placeholder="Mensaje"
            defaultValue={!isError ? state.message : ""}
          />
          {(errors?.message || errorContactFormData.message) && (
            <span className="text-red-300 text-sm mt-1">
              {errors?.message?.errors?.[0] || "Mensaje inválido"}
              {errorContactFormData.message && errorContactFormData.message}
            </span>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={
            isPending ||
            !!errorContactFormData.email ||
            !!errorContactFormData.name ||
            !!errorContactFormData.message
          }
          className="bg-white text-main px-4 py-2 rounded disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
};
