import { json, Response, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Avatar } from "~/components/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { type ResolvedRemixLoader } from "~/utils/types";
import {
  SpotifyConnect,
  SpotifyDisconnect
} from "~/routes/resources+/spotify+/_index";

type User = ResolvedRemixLoader<typeof loader>["user"];

export const loader = async ({ request }: LoaderArgs) => {
  const authUser = await requireUser(request);
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: authUser.id
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        guestProfile: true,
        connections: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            providerDisplayName: true
          }
        }
      }
    });

    return json({ user });
  } catch (err) {
    throw new Response("User not found.", { status: 404 });
  }
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const spotify = user.connections.find((item) => item.provider === "spotify");
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle>User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <dt>Name</dt>
            <dd>
              {user?.firstName} {user?.lastName}
            </dd>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </dl>
        </CardContent>
      </Card>
      {user?.guestProfile ? (
        <GuestDetails guestProfile={user.guestProfile} />
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardContent>
            <dl>
              <dt>Spotify</dt>
              <dd>
                {spotify ? (
                  <span>
                    Connected as{" "}
                    {spotify.providerDisplayName ?? spotify.providerAccountId}
                    <SpotifyDisconnect connectionId={spotify.id} />
                  </span>
                ) : (
                  <SpotifyConnect />
                )}
              </dd>
            </dl>
          </CardContent>
        </CardHeader>
      </Card>
    </>
  );
}

function GuestDetails({
  guestProfile
}: {
  guestProfile: NonNullable<User["guestProfile"]>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Avatar
          src={guestProfile.avatarUrl}
          alt={`${guestProfile.firstName} ${guestProfile.lastName}`}
          className="aspect-square h-16 bg-gradient-to-r from-crl-electric-purple to-crl-iridescent-blue p-0.5"
        />
        <dl>
          <dt>Name</dt>
          <dd>
            {guestProfile.firstName} {guestProfile.lastName}
          </dd>
          <dt>Company</dt>
          <dd>{guestProfile.company}</dd>
          <dt>Title</dt>
          <dd>{guestProfile.title}</dd>
          <dt>Twitter</dt>
          <dd>@{guestProfile.twitter}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
