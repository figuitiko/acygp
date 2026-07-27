import Link from "next/link";

import { getAdminNavigationItems, isAdminNavigationItemActive } from "./navigation";

export function AdminNavigation({ currentPath }: { currentPath: string }) {
  return (
    <nav aria-label="Navegación admin" className="rounded-2xl bg-white p-3 shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="px-2 text-sm font-bold uppercase tracking-[0.25em] text-main/70">
          Admin ACyGP
        </p>
        <div className="flex flex-wrap gap-2">
          {getAdminNavigationItems().map((item) => {
            const isActive = isAdminNavigationItemActive(item.href, currentPath);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  isActive
                    ? "bg-main text-white shadow"
                    : "border border-slate-200 text-slate-700 hover:border-main hover:text-main",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
