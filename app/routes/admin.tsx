import { Outlet } from "@remix-run/react";

export default function AdminLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
