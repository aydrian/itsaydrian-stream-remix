import { Outlet } from "@remix-run/react";

export default function ScenesLayout() {
  return (
    <div className="bg-red-600 h-screen grid grid-rows-[auto_200px] relative">
      <main className="flex gap-0 items-center justify-center z-10">
        <Outlet />
      </main>
      <footer className="bg-black text-white">Scene Footer</footer>
    </div>
  );
}
