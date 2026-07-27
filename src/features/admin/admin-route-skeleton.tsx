import { AdminNavigation } from "./admin-navigation";

export function AdminRouteSkeleton({ currentPath }: { currentPath: string }) {
  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <AdminNavigation currentPath={currentPath} />
        <div className="rounded-2xl bg-main p-6 shadow-lg">
          <div className="h-4 w-40 animate-pulse rounded bg-white/30" />
          <div className="mt-4 h-8 w-80 max-w-full animate-pulse rounded bg-white/60" />
          <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-white/25" />
          <div className="mt-2 h-4 w-2/3 max-w-xl animate-pulse rounded bg-white/25" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <SkeletonCard />
          <SkeletonCard rows={5} />
        </div>
      </section>
    </main>
  );
}

function SkeletonCard({ rows = 4 }: { rows?: number }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-md">
      <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    </section>
  );
}
