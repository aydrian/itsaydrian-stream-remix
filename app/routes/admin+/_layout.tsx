import type { LoaderArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const dbUser = await prisma.user
    .findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        guestProfile: { select: { avatarUrl: true } }
      }
    })
    .catch(() => {
      throw new Response("User not found. Odd.", { status: 404 });
    });
  return typedjson({ user: dbUser });
};

export default function AdminLayout() {
  const { user } = useTypedLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full p-4 shadow-lg">
        <div className="container mx-auto flex flex-col flex-wrap items-center md:flex-row">
          <div className="md:w-4/6">
            <div className="fill current w-auto text-4xl font-bold">
              Stream Admin
            </div>
          </div>
          <nav className="ml-5 inline-flex h-full items-center md:ml-0 md:w-2/6 md:justify-end">
            <div className="flex items-center gap-1">
              <span className="text-sm">Welcome, {user.firstName}</span>
              <form method="get" action="/admin/logout">
                <button className="rounded bg-cyan-600 px-2 py-1 text-sm font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-cyan-600/50">
                  Log out
                </button>
              </form>
              <Avatar>
                <AvatarImage src={user.guestProfile?.avatarUrl ?? undefined} />
                <AvatarFallback>{`${user.firstName.charAt(
                  0
                )}${user.lastName.charAt(0)}`}</AvatarFallback>
              </Avatar>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <Outlet />
      </main>
    </>
  );
}
