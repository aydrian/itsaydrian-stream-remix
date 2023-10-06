import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Avatar } from "~/components/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { ChangePwdForm } from "~/routes/auth+/form.changePwd";
import {
  SpotifyConnect,
  SpotifyDisconnect
} from "~/routes/resources+/spotify+/_index";
import {
  TwitchConnect,
  TwitchDisconnect
} from "~/routes/resources+/twitch+/_index";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { type ResolvedRemixLoader } from "~/utils/types";

type User = ResolvedRemixLoader<typeof loader>["user"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  try {
    const user = await prisma.user.findUniqueOrThrow({
      select: {
        connections: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            providerDisplayName: true
          }
        },
        email: true,
        firstName: true,
        guestProfile: true,
        id: true,
        lastName: true
      },
      where: {
        id: userId
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
  const twitch = user.connections.find((item) => item.provider === "twitch");
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      <div className="flex justify-start gap-4">
        <Card className="max-w-fit">
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <dt className="font-semibold">Name</dt>
              <dd className="text-sm">
                {user?.firstName} {user?.lastName}
              </dd>
              <dt className="font-semibold">Email</dt>
              <dd className="text-sm">{user?.email}</dd>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePwdForm email={user.email} />
          </CardContent>
        </Card>
        {user?.guestProfile ? (
          <GuestDetails guestProfile={user.guestProfile} />
        ) : null}
        <Card className="max-w-fit">
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-start gap-2">
              <Card>
                <CardHeader>
                  <CardTitle>Spotify</CardTitle>
                </CardHeader>
                <CardContent>
                  {spotify ? (
                    <>
                      <span>
                        Connected as{" "}
                        {spotify.providerDisplayName ??
                          spotify.providerAccountId}
                      </span>
                    </>
                  ) : null}
                </CardContent>
                <CardFooter className="flex justify-center">
                  {spotify ? (
                    <SpotifyDisconnect connectionId={spotify.id} />
                  ) : (
                    <SpotifyConnect />
                  )}
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Twitch</CardTitle>
                </CardHeader>
                <CardContent>
                  {twitch ? (
                    <div className="flex flex-col justify-center">
                      <span>
                        Connected as{" "}
                        {twitch.providerDisplayName ?? twitch.providerAccountId}
                      </span>
                      <Link relative="path" to="../twitch">
                        Twitch Settings
                      </Link>
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="flex justify-center">
                  {twitch ? (
                    <TwitchDisconnect connectionId={twitch.id} />
                  ) : (
                    <TwitchConnect />
                  )}
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function GuestDetails({
  guestProfile
}: {
  guestProfile: NonNullable<User["guestProfile"]>;
}) {
  return (
    <Card className="max-w-fit">
      <CardHeader>
        <CardTitle>Guest Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Avatar
            alt={`${guestProfile.firstName} ${guestProfile.lastName}`}
            className="aspect-square h-16 bg-gradient-to-r from-crl-electric-purple to-crl-iridescent-blue p-0.5"
            src={guestProfile.avatarUrl}
          />
        </div>
        <dl>
          <dt className="font-semibold">Name</dt>
          <dd className="text-sm">
            {guestProfile.firstName} {guestProfile.lastName}
          </dd>
          <dt className="font-semibold">Company</dt>
          <dd className="text-sm">{guestProfile.company}</dd>
          <dt className="font-semibold">Title</dt>
          <dd className="text-sm">{guestProfile.title}</dd>
          <dt className="font-semibold">Twitter</dt>
          <dd className="text-sm">@{guestProfile.twitter}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
