import { describe, expect, it } from "vitest";

import { buildFolderTree, flattenForSelect, getFolderPath, type FolderCountRow } from "./folder-tree";

function row(id: string, name: string, parentId: string | null): FolderCountRow {
  return { id, name, parentId, _count: { files: 0, children: 0 } };
}

describe("buildFolderTree", () => {
  it("returns an empty array for an empty list", () => {
    expect(buildFolderTree([])).toEqual([]);
  });

  it("nests children under their parent", () => {
    const flat = [row("root", "Reportes", null), row("child", "2024", "root")];

    const tree = buildFolderTree(flat);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("root");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("child");
  });

  it("sorts siblings by name at every level", () => {
    const flat = [row("b", "Bravo", null), row("a", "Alpha", null)];

    const tree = buildFolderTree(flat);

    expect(tree.map((node) => node.id)).toEqual(["a", "b"]);
  });
});

describe("getFolderPath", () => {
  it("returns the root-to-target ancestor chain", () => {
    const flat = [row("root", "Reportes", null), row("mid", "2024", "root"), row("leaf", "Q1", "mid")];

    const path = getFolderPath(flat, "leaf");

    expect(path.map((node) => node.id)).toEqual(["root", "mid", "leaf"]);
  });

  it("returns a single-item path for a root folder", () => {
    const flat = [row("root", "Reportes", null)];

    expect(getFolderPath(flat, "root").map((node) => node.id)).toEqual(["root"]);
  });

  it("returns an empty array for an unknown folder id", () => {
    const flat = [row("root", "Reportes", null)];

    expect(getFolderPath(flat, "missing")).toEqual([]);
  });

  it("does not loop forever if the data contains a cycle", () => {
    const flat = [row("a", "A", "b"), row("b", "B", "a")];

    expect(getFolderPath(flat, "a")).toEqual([]);
  });
});

describe("flattenForSelect", () => {
  it("depth-first flattens a tree with correct depth values", () => {
    const flat = [row("root", "Reportes", null), row("mid", "2024", "root"), row("leaf", "Q1", "mid")];
    const tree = buildFolderTree(flat);

    expect(flattenForSelect(tree)).toEqual([
      { id: "root", name: "Reportes", depth: 0 },
      { id: "mid", name: "2024", depth: 1 },
      { id: "leaf", name: "Q1", depth: 2 },
    ]);
  });

  it("returns an empty array for an empty tree", () => {
    expect(flattenForSelect([])).toEqual([]);
  });
});
