import { Outlet } from "@remix-run/react";

export default function ScenesLayout() {
  return (
    <div className="relative grid grid-rows-[50px_auto_150px] bg-red-600">
      <header className="bg-white">Scene Header</header>
      <main className="z-10 flex items-center justify-center gap-0">
        <Outlet />
      </main>
      <footer className="bg-black text-white">Scene Footer</footer>
    </div>
  );
}
