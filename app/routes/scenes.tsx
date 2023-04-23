import { Outlet } from "@remix-run/react";

export default function ScenesLayout() {
  return (
    <div className="bg-red-600 grid grid-rows-[50px_auto_150px] relative">
      <header className="bg-white">Scene Header</header>
      <main className="flex gap-0 items-center justify-center z-10">
        <Outlet />
      </main>
      <footer className="bg-black text-white">Scene Footer</footer>
    </div>
  );
}
