import { describe, expect, it } from "vitest";

import { createSubmitButtonLabel } from "./submit-button-label";

describe("createSubmitButtonLabel", () => {
  it("uses the normal label when not pending", () => {
    expect(createSubmitButtonLabel({ children: "Crear constancia", pending: false })).toBe("Crear constancia");
  });

  it("uses custom pending label while the form is submitting", () => {
    expect(
      createSubmitButtonLabel({
        children: "Crear constancia",
        pending: true,
        pendingLabel: "Creando constancia…",
      })
    ).toBe("Creando constancia…");
  });

  it("falls back to a calm generic pending label", () => {
    expect(createSubmitButtonLabel({ children: "Guardar", pending: true })).toBe("Procesando…");
  });
});
