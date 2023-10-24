import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { toast } from "react-toastify";
import { rehype } from "rehype";
import sanitize from "rehype-sanitize";

import { Icon } from "~/components/icon";
import {
  type ChatMessage,
  useChat
} from "~/routes/resources+/twitch+/chat.$channel";
import { nowPlayingCookie } from "~/utils/cookies.server";
import { getNextEpisode, prisma } from "~/utils/db.server";
import { type EpisodeGuests } from "~/utils/db.server";

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
  if (chat) {
    toast(<Chat message={chat} />, {
      position: "bottom-right",
      theme: "light"
    });
  }
  return <Outlet />;
}

function Chat({ message }: { message: ChatMessage }) {
  if (!message.html) {
    return;
  }

  const text = rehype()
    .data("settings", { fragment: true })
    .use(sanitize, {
      attributes: {
        "*": ["alt"],
        img: ["src"]
      },
      protocols: {
        src: ["https"]
      },
      strip: ["script"],
      tagNames: ["img", "marquee"]
    })
    .processSync(message.html)
    .toString();

  if (!text.length) {
    return;
  }

  return (
    <div className="flex">
      <img
        alt={message.author.username}
        className="h-16 w-16 rounded-md"
        src={message.author.profileImageUrl}
      />
      <div>
        <h2 className="font-semibold">{message.author.username}</h2>
        <p dangerouslySetInnerHTML={{ __html: text }} />
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
