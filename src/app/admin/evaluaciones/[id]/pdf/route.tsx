import { renderToBuffer } from "@react-pdf/renderer";

import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { IndividualEvaluationPdf } from "@/features/evaluaciones/server/pdf";
import { getEvaluationSubmission } from "@/features/evaluaciones/server/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submission = await getEvaluationSubmission(id);

  if (!submission) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<IndividualEvaluationPdf submission={submission} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="evaluacion-${id}.pdf"`,
    },
  });
}
