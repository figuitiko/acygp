"use client";

import { useState } from "react";

import { Check, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

import type { FolderNode } from "../domain/folder-tree";
import { NewFolderRow } from "./new-folder-row";

type FolderAction = (formData: FormData) => void | Promise<void>;

type FolderTreeProps = {
  nodes: FolderNode[];
  activeFolderId: string | null;
  expandedIds: ReadonlySet<string>;
  createAction: FolderAction;
  renameAction: FolderAction;
  deleteAction: FolderAction;
};

export function FolderTree({
  nodes,
  activeFolderId,
  expandedIds,
  createAction,
  renameAction,
  deleteAction,
}: FolderTreeProps) {
  return (
    <ul className="flex flex-col gap-1">
      {nodes.map((node) => (
        <FolderTreeNode
          key={node.id}
          node={node}
          depth={0}
          activeFolderId={activeFolderId}
          expandedIds={expandedIds}
          createAction={createAction}
          renameAction={renameAction}
          deleteAction={deleteAction}
        />
      ))}
    </ul>
  );
}

type FolderTreeNodeProps = {
  node: FolderNode;
  depth: number;
  activeFolderId: string | null;
  expandedIds: ReadonlySet<string>;
  createAction: FolderAction;
  renameAction: FolderAction;
  deleteAction: FolderAction;
};

function FolderTreeNode({
  node,
  depth,
  activeFolderId,
  expandedIds,
  createAction,
  renameAction,
  deleteAction,
}: FolderTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(expandedIds.has(node.id));
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);

  const isActive = node.id === activeFolderId;
  const hasChildren = node.children.length > 0;
  const canDelete = node._count.files === 0 && node._count.children === 0;

  return (
    <li>
      <div
        className={[
          "group flex items-center gap-1 rounded-lg py-1.5 pr-2 text-sm font-semibold transition",
          isActive ? "bg-main text-white" : "text-slate-700 hover:bg-slate-100",
        ].join(" ")}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isExpanded ? `Contraer ${node.name}` : `Expandir ${node.name}`}
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition ${
            hasChildren ? "" : "invisible"
          }`}
        >
          <ChevronRight
            size={14}
            className={isExpanded ? "rotate-90 transition-transform" : "transition-transform"}
          />
        </button>

        {isEditing ? (
          <form action={renameAction} className="flex flex-1 items-center gap-1">
            <input type="hidden" name="id" value={node.id} />
            <input
              name="name"
              defaultValue={node.name}
              autoFocus
              required
              onFocus={(event) => event.currentTarget.select()}
              className="w-full min-w-0 rounded-md px-1 py-0.5 text-sm font-semibold text-slate-900 outline-none"
            />
            <button
              type="submit"
              aria-label={`Guardar nombre de ${node.name}`}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-emerald-600 hover:bg-emerald-600 hover:text-white"
            >
              <Check size={12} />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              aria-label="Cancelar"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-600 hover:text-white"
            >
              <X size={12} />
            </button>
          </form>
        ) : (
          <>
            <Link href={`?folderId=${node.id}`} className="flex-1 truncate">
              {node.name} ({node._count.files})
            </Link>
            <span className="hidden items-center gap-0.5 group-hover:inline-flex group-focus-within:inline-flex">
              <button
                type="button"
                onClick={() => setIsCreatingChild((prev) => !prev)}
                aria-label={`Nueva subcarpeta en ${node.name}`}
                className={iconButtonClass(isActive)}
              >
                <Plus size={12} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label={`Renombrar ${node.name}`}
                className={iconButtonClass(isActive)}
              >
                <Pencil size={12} />
              </button>
              {canDelete ? (
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={node.id} />
                  <button
                    type="submit"
                    aria-label={`Eliminar ${node.name}`}
                    className={iconButtonClass(isActive)}
                  >
                    <Trash2 size={12} />
                  </button>
                </form>
              ) : (
                <span
                  title="Vaciá esta carpeta primero"
                  className={`${iconButtonClass(isActive)} cursor-not-allowed opacity-40`}
                >
                  <Trash2 size={12} />
                </span>
              )}
            </span>
          </>
        )}
      </div>

      {isCreatingChild && (
        <div style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }} className="py-1">
          <NewFolderRow
            action={createAction}
            parentId={node.id}
            autoOpen
            onCancel={() => setIsCreatingChild(false)}
          />
        </div>
      )}

      {hasChildren && isExpanded && (
        <ul className="flex flex-col gap-1">
          {node.children.map((child) => (
            <FolderTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFolderId={activeFolderId}
              expandedIds={expandedIds}
              createAction={createAction}
              renameAction={renameAction}
              deleteAction={deleteAction}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function iconButtonClass(isActive: boolean) {
  return `inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition hover:scale-110 ${
    isActive ? "text-white hover:bg-white/20" : "text-slate-500 hover:bg-slate-600 hover:text-white"
  }`;
}
