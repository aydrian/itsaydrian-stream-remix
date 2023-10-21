import { Link, Outlet, useMatches } from "@remix-run/react";
import { z } from "zod";

import { cn } from "~/utils/misc";

export const BreadcrumbHandle = z.object({ breadcrumb: z.any() });
export type BreadcrumbHandle = z.infer<typeof BreadcrumbHandle>;

const BreadcrumbHandleMatch = z.object({
  handle: BreadcrumbHandle
});

export default function ShowsLayout() {
  const matches = useMatches();
  const breadcrumbs = matches
    .map((m) => {
      const result = BreadcrumbHandleMatch.safeParse(m);
      if (!result.success || !result.data.handle.breadcrumb) return null;
      return (
        <Link className="flex items-center" key={m.id} to={m.pathname}>
          {result.data.handle.breadcrumb(m.data)}
        </Link>
      );
    })
    .filter(Boolean);
  return (
    <>
      <ul className="flex gap-3">
        <li>
          <Link className="text-muted-foreground" to="/admin/shows">
            Shows
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb, i, arr) => (
          <li
            className={cn("flex items-center gap-3", {
              "text-muted-foreground": i < arr.length - 1
            })}
            key={i}
          >
            ▶️ {breadcrumb}
          </li>
        ))}
      </ul>
      <Outlet />
    </>
  );
}
