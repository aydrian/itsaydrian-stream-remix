import type { LoaderArgs } from "@remix-run/node";
import { requireUser } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  return await requireUser(request);
};

export default function AdminDashboard() {
  return (
    <main>
      <h2>Admin Dashboard</h2>
      <form method="get" action="/admin/logout">
        <button className="rounded bg-cyan-600 px-2 py-1 text-sm font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-cyan-600/50">
          Log out
        </button>
      </form>
    </main>
  );
}
