export type FolderCountRow = {
  id: string;
  name: string;
  parentId: string | null;
  _count: { files: number; children: number };
};

export type FolderNode = FolderCountRow & { children: FolderNode[] };

export function buildFolderTree(flat: FolderCountRow[]): FolderNode[] {
  const nodes = new Map<string, FolderNode>(flat.map((row) => [row.id, { ...row, children: [] }]));
  const roots: FolderNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  sortTree(roots);
  return roots;
}

function sortTree(nodes: FolderNode[]) {
  nodes.sort((a, b) => a.name.localeCompare(b.name));
  for (const node of nodes) sortTree(node.children);
}

export function getFolderPath(flat: FolderCountRow[], folderId: string): FolderCountRow[] {
  const byId = new Map(flat.map((row) => [row.id, row]));
  const path: FolderCountRow[] = [];
  const visited = new Set<string>();

  let current = byId.get(folderId);
  while (current) {
    if (visited.has(current.id)) return [];
    visited.add(current.id);
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}

export function flattenForSelect(tree: FolderNode[]): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = [];

  function walk(nodes: FolderNode[], depth: number) {
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name, depth });
      walk(node.children, depth + 1);
    }
  }

  walk(tree, 0);
  return result;
}
