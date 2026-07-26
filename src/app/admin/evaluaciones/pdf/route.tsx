import { renderToBuffer } from "@react-pdf/renderer";

import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { BatchEvaluationsPdf } from "@/features/evaluaciones/server/pdf";
import { listEvaluationSubmissionsForPdf } from "@/features/evaluaciones/server/repository";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const submissions = await listEvaluationSubmissionsForPdf({
      q: searchParams.get("q"),
      formId: searchParams.get("formId"),
      workflowStatus: searchParams.get("workflowStatus"),
      outcome: searchParams.get("outcome"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });
    const buffer = await renderToBuffer(<BatchEvaluationsPdf submissions={submissions} />);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=\"evaluaciones-acygp.pdf\"",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("batch-pdf-limit:")) {
      return Response.json({ error: "Too many matching results. Narrow filters to 500 or fewer records." }, { status: 400 });
    }

    console.error(error);
    return Response.json({ error: "Could not generate PDF" }, { status: 500 });
  }
}
