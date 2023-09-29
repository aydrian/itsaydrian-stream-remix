import { type LoaderArgs, Response, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { DuplicateEpisodeForm } from "~/routes/resources+/episode-duplicate";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";
import { generateVDOPassword } from "~/utils/vdo-ninja.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  const { episodeId } = params;
  const episode = await prisma.episode
    .findUniqueOrThrow({
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
        subtitle: true,
        title: true,
        vdoPassword: true
      },
      where: { id: episodeId }
    })
    .catch((error) => {
      console.error(error);
      throw new Response(null, { status: 404, statusText: "Not Found" });
    });

  const vdoConfig = {
    hash: await generateVDOPassword(episode.vdoPassword),
    password: episode.vdoPassword,
    room: episode.show.title.toLowerCase().replace(/ /g, "_")
  };

  return json({ ...episode, vdoConfig });
};

export default function EpisodeIdIndex() {
  const {
    description,
    endDate,
    guests,
    id,
    startDate,
    subtitle,
    title,
    vdoConfig
  } = useLoaderData<typeof loader>();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {title}
            {subtitle ? `: ${subtitle}` : null}
          </CardTitle>
          <CardDescription>
            {formatDateRange(startDate, endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>{description}</div>
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {guests.map(({ guest, order }, index) => (
                  <Card className="md:w-60" key={guest.id}>
                    <CardHeader>
                      <CardTitle>{`${guest.firstName} ${guest.lastName}`}</CardTitle>
                      <CardDescription>
                        {index === 0 ? "Host" : `Guest ${index}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {index === 0 ? (
                        <div>
                          Control Center:{" "}
                          <pre className="text-xs">
                            <a
                              href={`https://vdo.ninja/?director=${vdoConfig.room}&password=${vdoConfig.password}`}
                              rel="noreferrer"
                              target="_blank"
                            >{`https://vdo.ninja/?director=${vdoConfig.room}&password=${vdoConfig.password}`}</a>
                          </pre>
                        </div>
                      ) : (
                        <div>
                          Join Link:{" "}
                          <pre className="text-xs">
                            <a
                              href={`https://vdo.ninja/?room=${vdoConfig.room}&id=Guest${order}&hash=${vdoConfig.hash}`}
                            >{`https://vdo.ninja/?room=${vdoConfig.room}&id=Guest${order}&hash=${vdoConfig.hash}`}</a>
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild size="sm">
            <Link to="./edit">Edit</Link>
          </Button>
          <DuplicateEpisodeForm episodeId={id} />
        </CardFooter>
      </Card>
    </>
  );
}
