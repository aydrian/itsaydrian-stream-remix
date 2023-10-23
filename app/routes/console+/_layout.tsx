import type { LoaderFunctionArgs } from "@remix-run/node";

import { Link, NavLink, Outlet } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { twMerge } from "tailwind-merge";

import { Icon } from "~/components/icon";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import controlRoomLogo from "~/images/control-room-logo.svg";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const dbUser = await prisma.user
    .findUniqueOrThrow({
      select: {
        email: true,
        firstName: true,
        guestProfile: { select: { avatarUrl: true } },
        id: true,
        lastName: true
      },
      where: { id: userId }
    })
    .catch(() => {
      throw new Response("User not found. Odd.", { status: 404 });
    });
  return typedjson({ user: dbUser });
};

export default function ConsoleLayout() {
  const { user } = useTypedLoaderData<typeof loader>();
  const navLinkDefaultClassName =
    "text-sm font-medium transition-colors hover:text-primary";
  return (
    <>
      <header className="fixed w-full">
        <div className="flex items-center bg-[#f5f5f5]">
          <div className="container flex h-full items-center justify-between py-2">
            <div className="flex items-center gap-1">
              <img
                alt="Control Room"
                className="h-7 w-auto sm:h-20"
                src={controlRoomLogo}
              />
              <div className="fill current w-auto text-3xl font-bold sm:text-6xl">
                Control Room
              </div>
            </div>
            <div className="ml-5 inline-flex h-full items-center md:ml-0 md:justify-end">
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="relative h-12 w-12 rounded-lg"
                      variant="ghost"
                    >
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage
                          src={user.guestProfile?.avatarUrl ?? undefined}
                        />
                        <AvatarFallback>{`${user.firstName.charAt(
                          0
                        )}${user.lastName.charAt(0)}`}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" forceMount>
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
                      <Icon className="mr-2 h-4 w-4" name="user" />
                      <Link to="/console/settings/profile">Profile</Link>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Icon className="mr-2 h-4 w-4" name="log-out" />
                      <Link to="/auth/logout">Log out</Link>
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center bg-cyan-500 py-2 font-medium text-white">
          <nav className="container flex items-center space-x-4 lg:space-x-6">
            <NavLink
              className={({ isActive }) =>
                twMerge(navLinkDefaultClassName, isActive && "text-green-800")
              }
              to="/console"
            >
              Home
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                twMerge(navLinkDefaultClassName, isActive && "text-green-800")
              }
              to="/console/shows"
            >
              Shows
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                twMerge(navLinkDefaultClassName, isActive && "text-green-800")
              }
              to="/console/guests"
            >
              Guests
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container grow bg-[#f5f5f5] pt-[150px]">
        <Outlet />
      </main>
      <footer className="flex items-center bg-cyan-800 p-2">
        <div className="container flex items-center justify-between text-xs text-white">
          <div className="flex items-center justify-start">
            © ItsAydrian Stream Control Room 2023 All Rights Reserved.
          </div>
          <div>
            <a
              href="https://github.com/aydrian/itsaydrian-stream-remix"
              rel="noreferrer"
              target="_blank"
            >
              <Icon className="h-6 w-6" name="github" />
              <span className="sr-only">Control Room GitHub Repository</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
