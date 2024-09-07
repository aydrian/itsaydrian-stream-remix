import { json, type LoaderFunctionArgs } from "@remix-run/node";
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
import { generateDirectorUrl, getGuestLinks } from "~/utils/vdo-ninja.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const { episodeId } = params;
  const episodeResult = await prisma.episode
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
  const { guests: guestResults, ...episode } = episodeResult;

  const room = episode.show.title.toLowerCase().replace(/ /g, "_");
  const guests = await Promise.all(
    guestResults.map(async ({ guest, order }) => ({
      ...guest,
      ...(await getGuestLinks(room, `Guest${order}`, episode.vdoPassword))
    }))
  );

  const directorUrl = generateDirectorUrl(room, episode.vdoPassword);

  return json({ ...episode, directorUrl, guests });
};

export default function EpisodeIdIndex() {
  const {
    description,
    directorUrl,
    endDate,
    guests,
    id,
    startDate,
    subtitle,
    title
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
                {guests.map((guest, index) => (
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
                              href={directorUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {directorUrl}
                            </a>
                          </pre>
                        </div>
                      ) : (
                        <>
                          <div>
                            Push Camera Link:{" "}
                            <pre className="text-xs">
                              <a href={guest.pushCameraUrl}>
                                {guest.pushCameraUrl}
                              </a>
                            </pre>
                          </div>
                          <div>
                            Push Screen Link:{" "}
                            <pre className="text-xs">
                              <a href={guest.pushScreenUrl}>
                                {guest.pushScreenUrl}
                              </a>
                            </pre>
                          </div>
                          <div>
                            Join Link:{" "}
                            <pre className="text-xs">
                              <a href={guest.joinUrl}>{guest.joinUrl}</a>
                            </pre>
                          </div>
                        </>
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
