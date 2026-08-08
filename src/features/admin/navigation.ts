export type AdminNavigationItem = {
  label: string;
  href: string;
};

const ADMIN_NAVIGATION_ITEMS: AdminNavigationItem[] = [
  { label: "Constancias", href: "/admin/constancias" },
  { label: "Evaluaciones", href: "/admin/evaluaciones" },
  { label: "Archivos", href: "/admin/archivos" },
];

export function getAdminNavigationItems() {
  return ADMIN_NAVIGATION_ITEMS;
}

export function isAdminNavigationItemActive(itemHref: string, currentPath: string) {
  return currentPath === itemHref || currentPath.startsWith(`${itemHref}/`);
}
