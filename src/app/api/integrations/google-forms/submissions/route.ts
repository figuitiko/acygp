import { ZodError } from "zod";

import { ingestGoogleFormsSubmission } from "@/features/evaluaciones/server/repository";
import {
  parseGoogleFormsSubmissionPayload,
  verifyGoogleFormsWebhookSecret,
} from "@/features/evaluaciones/server/webhook";

export async function POST(request: Request) {
  let isAuthorized = false;

  try {
    isAuthorized = verifyGoogleFormsWebhookSecret({
      provided: request.headers.get("x-acygp-webhook-secret"),
      expected: process.env.GOOGLE_FORMS_WEBHOOK_SECRET,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Webhook secret is not configured" }, { status: 500 });
  }

  if (!isAuthorized) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = parseGoogleFormsSubmissionPayload(await request.json());
    const result = await ingestGoogleFormsSubmission(payload);

    return Response.json(
      {
        ok: true,
        created: result.created,
        submissionId: result.submission.id,
        workflowStatus: result.submission.workflowStatus,
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return Response.json({ error: "Malformed Google Forms submission payload" }, { status: 400 });
    }

    console.error(error);
    return Response.json({ error: "Temporary ingestion failure" }, { status: 503 });
  }
}
