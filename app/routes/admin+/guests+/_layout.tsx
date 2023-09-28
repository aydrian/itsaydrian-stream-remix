import { Link, Outlet, useMatches } from "@remix-run/react";

import { cn } from "~/utils/misc";

export default function GuestsLayout() {
  const matches = useMatches();
  const breadcrumbs = matches
    .map((m) =>
      m.handle?.breadcrumb ? (
        <Link className="flex items-center" key={m.id} to={m.pathname}>
          {m.handle.breadcrumb(m.data)}
        </Link>
      ) : null
    )
    .filter(Boolean);
  return (
    <>
      <ul className="flex gap-3">
        <li>
          <Link className="text-muted-foreground" to="/admin/guests">
            Guests
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
