import { Outlet } from "@remix-run/react";

export const handle = {
  breadcrumb: () => <span>Episodes</span>
};

export default function EpisodesLayout() {
  return <Outlet />;
}
