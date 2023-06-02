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
      vdoPassword: true,
      guests: {
        select: {
          order: true,
          guest: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: { order: "asc" }
      },
      show: { select: { title: true } }
    }
  });
  if (!findEpisode) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const { guests: findGuests, show, vdoPassword, ...rest } = findEpisode;
  const guests = findGuests.map(({ guest, order }) => ({ order, ...guest }));

  const vdoConfig = {
    room: show.title.toLowerCase().replace(/ /g, "_"),
    password: vdoPassword,
    hash: await generateVDOPassword(vdoPassword)
  };

  return json({ ...rest, guests, show, vdoConfig });
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
