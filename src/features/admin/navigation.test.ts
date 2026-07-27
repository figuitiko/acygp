import { describe, expect, it } from "vitest";

import { getAdminNavigationItems, isAdminNavigationItemActive } from "./navigation";

describe("admin navigation", () => {
  it("exposes the admin sections", () => {
    expect(getAdminNavigationItems()).toEqual([
      { label: "Constancias", href: "/admin/constancias" },
      { label: "Evaluaciones", href: "/admin/evaluaciones" },
    ]);
  });

  it("marks a section active by current path prefix", () => {
    expect(isAdminNavigationItemActive("/admin/constancias", "/admin/constancias/ABC/editar")).toBe(true);
    expect(isAdminNavigationItemActive("/admin/evaluaciones", "/admin/evaluaciones/formularios/123")).toBe(true);
    expect(isAdminNavigationItemActive("/admin/constancias", "/admin/evaluaciones")).toBe(false);
  });
});
