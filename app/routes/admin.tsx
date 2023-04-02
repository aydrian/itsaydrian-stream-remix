import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/admin/login"
  });

  return json({ user });
};

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <header>
        Admin Header: Welcome {user.screen_name}{" "}
        <form method="get" action="/admin/logout">
          <button>Log out</button>
        </form>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
