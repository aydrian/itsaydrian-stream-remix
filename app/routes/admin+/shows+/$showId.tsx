import { type LoaderArgs, json, Response } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request);
  const { showId } = params;
  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: {
      id: true,
      title: true,
      description: true,
      Episodes: {
        select: { id: true, startDate: true, endDate: true, title: true },
        orderBy: { startDate: "desc" }
      }
    }
  });
  if (!show) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  return json({ ...show });
};

export default function ShowPage() {
  const { title, description, Episodes } = useLoaderData<typeof loader>();
  return (
    <>
      <section>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </section>
      <section>
        <h3>Episodes</h3>
        <div>
          {Episodes.map((episode) => (
            <div key={episode.id}>
              <div>
                <Link to={`./episodes/${episode.id}`}>{episode.title}</Link>
              </div>
              <div>{formatDateRange(episode.startDate, episode.endDate)}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
