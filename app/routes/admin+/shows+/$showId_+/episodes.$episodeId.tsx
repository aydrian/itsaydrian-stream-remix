import { type LoaderArgs, json, Response } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";
import { generateVDOPassword } from "~/utils/vdo-ninja.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request);
  const { episodeId } = params;
  const findEpisode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      title: true,
      description: true,
      Guests: {
        select: {
          order: true,
          Guest: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: { order: "asc" }
      },
      Show: { select: { title: true } }
    }
  });
  if (!findEpisode) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const { Guests, Show, ...rest } = findEpisode;
  const guests = Guests.map(({ Guest, order }) => ({ order, ...Guest }));

  const vdoConfig = {
    room: Show.title.toLowerCase().replace(/ /g, "_"),
    password: "hello",
    hash: await generateVDOPassword("hello")
  };

  return json({ ...rest, guests, show: Show, vdoConfig });
};

export default function ShowPage() {
  const { title, description, startDate, endDate, guests, vdoConfig } =
    useLoaderData<typeof loader>();
  return (
    <>
      <section>
        <h2>{title}</h2>
        <div>{formatDateRange(startDate, endDate)}</div>
        {description ? <p>{description}</p> : null}
      </section>
      <section>
        <h3>Guests</h3>
        <ol>
          {guests.map((guest) => (
            <li key={guest.id}>
              {guest.firstName} {guest.lastName}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h3>Links</h3>
        <div>
          <span>Control Center:</span>
          <pre>
            <a
              href={`https://vdo.ninja/?director=${vdoConfig.room}&password=${vdoConfig.password}`}
            >{`https://vdo.ninja/?director=${vdoConfig.room}&password=${vdoConfig.password}`}</a>
          </pre>
        </div>
        <div>
          <span>Invite Guest:</span>
          <pre>
            <a
              href={`https://vdo.ninja/?room=${vdoConfig.room}&hash=${vdoConfig.hash}`}
            >{`https://vdo.ninja/?room=${vdoConfig.room}&hash=${vdoConfig.hash}`}</a>
          </pre>
        </div>
      </section>
    </>
  );
}
