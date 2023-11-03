import type { LinksFunction, MetaFunction } from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "remix-development-tools/index.css";

import iconHref from "~/components/icons/sprite.svg";
import "~/tailwind.css";

export const links: LinksFunction = () => [
  // Preload CSS as a resource to avoid render blocking
  { as: "image", href: iconHref, rel: "preload", type: "image/svg+xml" },
  {
    as: "style",
    href: "/fonts/atkinson-hyperlegible/font.css",
    rel: "preload"
  },
  { as: "style", href: "/fonts/poppins/font.css", rel: "preload" },
  { href: "/fonts/atkinson-hyperlegible/font.css", rel: "stylesheet" },
  { href: "/fonts/poppins/font.css", rel: "stylesheet" }
];

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "ItsAydrian Stream" },
    { viewport: "width=device-width,initial-scale=1" }
  ];
};

function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen flex-col">
        <Outlet />
        <ToastContainer />
        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  );
}

let AppExport = App;
if (process.env.NODE_ENV === "development") {
  const { withDevTools } = await import("remix-development-tools");
  AppExport = withDevTools(AppExport);
}

export default AppExport;
