import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import type { LoaderArgs } from "@remix-run/node";
import { Link, NavLink, Outlet } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { LogOut, User } from "lucide-react";
import { twMerge } from "tailwind-merge";

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
  const navLinkDefaultClassName =
    "text-sm font-medium transition-colors hover:text-primary";
  return (
    <>
      <header className="w-full p-4 shadow-lg">
        <div className="container mx-auto flex flex-col flex-wrap items-center md:flex-row">
          <div className="md:w-2/6">
            <div className="fill current w-auto text-3xl font-bold">
              Stream Admin
            </div>
          </div>
          <div className="flex items-center space-x-4 md:w-2/6 lg:space-x-6">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                twMerge(navLinkDefaultClassName, isActive && "text-blue-700")
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/shows"
              className={({ isActive }) =>
                twMerge(navLinkDefaultClassName, isActive && "text-blue-700")
              }
            >
              Shows
            </NavLink>
            <NavLink
              to="/admin/guests"
              className={({ isActive }) =>
                twMerge(navLinkDefaultClassName, isActive && "text-blue-700")
              }
            >
              Guests
            </NavLink>
          </div>
          <nav className="ml-5 inline-flex h-full items-center md:ml-0 md:w-2/6 md:justify-end">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage
                        src={user.guestProfile?.avatarUrl ?? undefined}
                      />
                      <AvatarFallback>{`${user.firstName.charAt(
                        0
                      )}${user.lastName.charAt(0)}`}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <Link to="/admin/settings/profile">Profile</Link>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <Link to="/admin/logout">Log out</Link>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
