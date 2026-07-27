export function createSubmitButtonLabel({
  children,
  pending,
  pendingLabel,
}: {
  children: string;
  pending: boolean;
  pendingLabel?: string;
}) {
  return pending ? pendingLabel ?? "Procesando…" : children;
}
