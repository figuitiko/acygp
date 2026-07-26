import path from "node:path";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { formatScore } from "../domain/evaluation";

type FullSubmission = NonNullable<Awaited<ReturnType<typeof import("./repository").getEvaluationSubmission>>>;
type SummarySubmission = Awaited<ReturnType<typeof import("./repository").listEvaluationSubmissionsForPdf>>[number];

const logoPath = path.join(process.cwd(), "public", "logo-acygp.png");
const disclaimer = "Resultado de evaluación de conocimientos. No es constancia ni certificado.";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#1f2937", fontFamily: "Helvetica" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18, borderBottomWidth: 1, borderBottomColor: "#dbe3f0", paddingBottom: 12 },
  logo: { width: 58, height: 58, objectFit: "contain" },
  title: { fontSize: 18, color: "#315399", fontWeight: 700 },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 4 },
  card: { borderWidth: 1, borderColor: "#dbe3f0", borderRadius: 8, padding: 12, marginBottom: 12 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 120, fontWeight: 700, color: "#315399" },
  value: { flex: 1 },
  sectionTitle: { fontSize: 13, color: "#315399", fontWeight: 700, marginBottom: 8 },
  answer: { marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#eef2f7" },
  question: { fontWeight: 700, marginBottom: 3 },
  tableHeader: { flexDirection: "row", backgroundColor: "#315399", color: "#ffffff", padding: 5, fontSize: 8, fontWeight: 700 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", padding: 5, fontSize: 8 },
  c1: { width: "18%" },
  c2: { width: "19%" },
  c3: { width: "20%" },
  c4: { width: "10%" },
  c5: { width: "10%" },
  c6: { width: "12%" },
  c7: { width: "11%" },
  disclaimer: { marginTop: 14, fontSize: 9, color: "#b45309", borderTopWidth: 1, borderTopColor: "#fde68a", paddingTop: 8 },
});

export function IndividualEvaluationPdf({ submission }: { submission: FullSubmission }) {
  return (
    <Document title={`Evaluación ${submission.participantName ?? submission.googleResponseId}`}>
      <Page size="LETTER" style={styles.page}>
        <Header title="Resultado de evaluación" subtitle={submission.form.evaluationName ?? submission.form.googleFormTitle} />
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos del participante</Text>
          <Info label="Nombre" value={submission.participantName ?? "Sin mapear"} />
          <Info label="Email" value={submission.participantEmail ?? submission.respondentEmail ?? "Sin mapear"} />
          <Info label="Evaluación" value={submission.form.evaluationName ?? submission.form.googleFormTitle} />
          <Info label="Fecha de envío" value={formatDate(submission.submittedAt)} />
          <Info label="Fecha de revisión" value={submission.reviewedAt ? formatDate(submission.reviewedAt) : "Pendiente"} />
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resultado</Text>
          <Info label="Calificación final" value={formatScore(submission.finalScore, submission.finalMaxScore)} />
          <Info label="Umbral usado" value={submission.thresholdSnapshot !== null ? `${submission.thresholdSnapshot}%` : "Pendiente"} />
          <Info label="Resultado" value={submission.outcome ?? "Pendiente"} />
          <Info label="Notas" value={submission.reviewerNotes ?? "Sin notas"} />
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preguntas y respuestas</Text>
          {submission.answers.map((answer) => (
            <View key={answer.id} style={styles.answer}>
              <Text style={styles.question}>{answer.questionTitleSnapshot}</Text>
              <Text>{answer.answer || "Sin respuesta"}</Text>
              {(answer.score !== null || answer.maxScore !== null) && (
                <Text>Score Google: {formatScore(answer.score, answer.maxScore)}</Text>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.disclaimer}>{disclaimer}</Text>
      </Page>
    </Document>
  );
}

export function BatchEvaluationsPdf({ submissions }: { submissions: SummarySubmission[] }) {
  return (
    <Document title="Evaluaciones ACyGP">
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <Header title="Resumen de evaluaciones" subtitle={`${submissions.length} registros exportados`} />
        <View style={styles.tableHeader}>
          <Text style={styles.c1}>Participante</Text>
          <Text style={styles.c2}>Email</Text>
          <Text style={styles.c3}>Evaluación</Text>
          <Text style={styles.c4}>Score</Text>
          <Text style={styles.c5}>Resultado</Text>
          <Text style={styles.c6}>Envío</Text>
          <Text style={styles.c7}>Revisión</Text>
        </View>
        {submissions.map((submission) => (
          <View key={submission.id} style={styles.tableRow} wrap={false}>
            <Text style={styles.c1}>{submission.participantName ?? "Sin mapear"}</Text>
            <Text style={styles.c2}>{submission.participantEmail ?? submission.respondentEmail ?? "Sin mapear"}</Text>
            <Text style={styles.c3}>{submission.form.evaluationName ?? submission.form.googleFormTitle}</Text>
            <Text style={styles.c4}>{formatScore(submission.finalScore, submission.finalMaxScore)}</Text>
            <Text style={styles.c5}>{submission.outcome ?? "Pendiente"}</Text>
            <Text style={styles.c6}>{formatDate(submission.submittedAt)}</Text>
            <Text style={styles.c7}>{submission.reviewedAt ? formatDate(submission.reviewedAt) : "Pendiente"}</Text>
          </View>
        ))}
        <Text style={styles.disclaimer}>{disclaimer}</Text>
      </Page>
    </Document>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <Image src={logoPath} style={styles.logo} />
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Mexico_City" }).format(date);
}
