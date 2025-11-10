import { z, ZodError } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

export type ContactFormState = ContactFormData | ZodError<ContactFormData>;

export async function sendContactMessage(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    message: formData.get("message") as string,
  };
  console.log("Received form data:", data);

  const result = contactSchema.safeParse(data);

  if (!result.success) {
    // Return the ZodError directly - already properly typed
    return result.error as ZodError<ContactFormData>;
  }

  // Here you would send the email or save to database
  console.log("Valid data:", result.data);

  // Return the validated data on success
  return result.data;
}
