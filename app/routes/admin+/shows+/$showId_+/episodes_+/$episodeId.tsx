import { type LoaderArgs, Response, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";
import { generateVDOPassword } from "~/utils/vdo-ninja.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  const { episodeId } = params;
  const findEpisode = await prisma.episode.findUnique({
    select: {
      description: true,
      endDate: true,
      guests: {
        orderBy: { order: "asc" },
        select: {
          guest: {
            select: { firstName: true, id: true, lastName: true }
          },
          order: true
        }
      },
      id: true,
      show: { select: { title: true } },
      startDate: true,
      title: true,
      vdoPassword: true
    },
    where: { id: episodeId }
  });
  if (!findEpisode) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const { guests: findGuests, show, vdoPassword, ...rest } = findEpisode;
  const guests = findGuests.map(({ guest, order }) => ({ order, ...guest }));

  const vdoConfig = {
    hash: await generateVDOPassword(vdoPassword),
    password: vdoPassword,
    room: show.title.toLowerCase().replace(/ /g, "_")
  };

  return json({ ...rest, guests, show, vdoConfig });
};

export default function ShowPage() {
  const { description, endDate, guests, startDate, title, vdoConfig } =
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
          <ol>
            {guests.slice(1).map((guest) => (
              <li key={guest.id}>
                {guest.firstName}:
                <pre>
                  <a
                    href={`https://vdo.ninja/?room=${vdoConfig.room}&id=Guest${guest.order}&hash=${vdoConfig.hash}`}
                  >{`https://vdo.ninja/?room=${vdoConfig.room}&id=Guest${guest.order}&hash=${vdoConfig.hash}`}</a>
                </pre>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
