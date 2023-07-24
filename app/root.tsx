import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  // Preload CSS as a resource to avoid render blocking
  {
    as: "style",
    href: "/fonts/atkinson-hyperlegible/font.css",
    rel: "preload"
  },
  { as: "style", href: "/fonts/poppins/font.css", rel: "preload" },
  { as: "style", href: stylesheet, rel: "preload" },
  { href: "/fonts/atkinson-hyperlegible/font.css", rel: "stylesheet" },
  { href: "/fonts/poppins/font.css", rel: "stylesheet" },
  { href: stylesheet, rel: "stylesheet" }
];

export const meta: V2_MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "ItsAydrian Stream" },
    { viewport: "width=device-width,initial-scale=1" }
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
