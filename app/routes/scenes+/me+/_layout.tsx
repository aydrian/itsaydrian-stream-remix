import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { toast } from "react-toastify";

import { Icon } from "~/components/icon";
import {
  type ChatMessage,
  useChat
} from "~/routes/resources+/twitch+/chat.$channel";
import {
  type FollowMessage,
  type RaidMessage,
  type SubscribeMessage,
  useEventSub
} from "~/routes/resources+/twitch+/eventsub.$channel";
import { nowPlayingCookie } from "~/utils/cookies.server";
import { getNextEpisode, prisma } from "~/utils/db.server";
import { type EpisodeGuests } from "~/utils/db.server";
import { cn } from "~/utils/misc";

export async function loader({ request }: LoaderFunctionArgs) {
  const [episode, spotifyConnection] = await Promise.all([
    getNextEpisode("ME"),
    // TODO: Need better way to get Spotify connection
    prisma.connection.findUnique({
      select: {
        accessToken: true,
        expiresAt: true,
        id: true,
        refreshToken: true
      },
      where: { id: "6a003ecf-8f0b-44d4-a943-ba97649587d2" }
    })
  ]);
  return json(
    { episode },
    {
      headers: {
        "Set-Cookie": await nowPlayingCookie.serialize(spotifyConnection)
      }
    }
  );
}

export function useEpisode() {
  const data = useRouteLoaderData<typeof loader>("routes/scenes+/me+/_layout");
  if (data === undefined) {
    throw new Error(
      "useEpisode must be used within the routes/scenes+/me+/ route or its children"
    );
  }
  return { ...data.episode };
}

export default function Layout() {
  const chat = useChat("itsaydrian");
  const { follow, raid, subscribe } = useEventSub("itsaydrian");

  if (chat) {
    toast(<Chat message={chat} />, {
      // autoClose: false,
      closeButton: false,
      position: "bottom-right",
      theme: "light"
    });
  }

  if (follow) {
    toast(<FollowAlert message={follow} />, {
      // autoClose: false,
      closeButton: false,
      position: "top-center",
      theme: "light"
    });
  }

  if (subscribe) {
    toast(<SubscribeAlert message={subscribe} />, {
      // autoClose: false,
      closeButton: false,
      position: "top-center",
      theme: "light"
    });
  }

  if (raid) {
    toast(<RaidAlert message={raid} />, {
      // autoClose: false,
      closeButton: false,
      position: "top-center",
      theme: "light"
    });
  }

  return <Outlet />;
}

function Chat({ message }: { message: ChatMessage }) {
  if (!message.html) {
    return;
  }

  return (
    <div className="flex w-full gap-2">
      <img
        alt={message.author.username}
        className="h-16 w-16 rounded-md shadow-sm"
        src={message.author.profileImageUrl}
      />
      <div className="grow">
        <h2
          className={cn(
            "text-lg font-semibold text-gray-800 ",
            message.author.roles.includes("SUBSCRIBER") && "text-cyan-600",
            message.author.roles.includes("MODERATOR") && "text-pink-600",
            message.author.roles.includes("BROADCASTER") && "text-green-600"
          )}
        >
          {message.author.username}
        </h2>
        <p dangerouslySetInnerHTML={{ __html: message.html }} />
      </div>
    </div>
  );
}

function FollowAlert({ message }: { message: FollowMessage }) {
  return (
    <>
      <audio autoPlay>
        <source src="/sfx/follow_alert.mp3" type="audio/mp3" />
      </audio>
      <div className="flex w-full gap-2">
        <img
          alt={message.viewer.displayName}
          className="h-16 w-16 rounded-md shadow-sm"
          src={message.viewer.profilePictureUrl}
        />
        <div className="grow">{`${message.viewer.displayName} just followed!`}</div>
      </div>
    </>
  );
}

function SubscribeAlert({ message }: { message: SubscribeMessage }) {
  return (
    <>
      <audio autoPlay>
        <source src="/sfx/subscribe_alert.mp3" type="audio/mp3" />
      </audio>
      <div className="flex w-full gap-2">
        <img
          alt={message.viewer.displayName}
          className="h-16 w-16 rounded-md shadow-sm"
          src={message.viewer.profilePictureUrl}
        />
        <div className="grow">{`${message.viewer.displayName} just subscribed!`}</div>
      </div>
    </>
  );
}

function RaidAlert({ message }: { message: RaidMessage }) {
  return (
    <div className="flex w-full gap-2">
      <img
        alt={message.raider.displayName}
        className="h-16 w-16 rounded-md shadow-sm"
        src={message.raider.profilePictureUrl}
      />
      <div className="grow text-center">
        <span className="font-semibold">{`@${message.raider.displayName} `}</span>
        {`is raiding with ${message.viewers} `}
        viewers! 🎉`
      </div>
    </div>
  );
}

export function CompactCaption({ guest }: { guest: EpisodeGuests[number] }) {
  return (
    <figcaption className="absolute bottom-0 left-0 z-10 w-full bg-blue-950 px-4 pb-[.625rem] pt-2">
      <div className="flex w-full flex-row items-baseline justify-between">
        <h1 className="relative z-10 block text-3xl font-semibold text-white">
          <span>{guest.firstName}</span>
        </h1>
        {guest.twitter && (
          <h2 className="text-2xl text-slate-100">
            <Icon className="mr-2 inline-block h-6 w-6" name="twitter" />
            <span>@{guest.twitter}</span>
          </h2>
        )}
      </div>
    </figcaption>
  );
}
