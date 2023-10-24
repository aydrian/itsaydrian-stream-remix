import { type ChatUserstate, type CommonUserstate } from "tmi.js";

import { cachified } from "~/utils/cache.server.js";

const TWITCH_CDN_URL = "https://static-cdn.jtvnw.net/emoticons/v1";

export const parseCommand = (message: string) => {
  const [cmd, ...args] = message.split(" ");
  const command = cmd.replace("!", "");

  return {
    args: args || [],
    command
  };
};

export const parseAuthor = async (channel: string, meta: ChatUserstate) => {
  let profileImageUrl =
    "https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-300x300.png";
  const id = meta["user-id"];
  if (id) {
    const user = await cachified({
      async getFreshValue() {
        return fetch(`/api/twitchUser?userId=${id}`).then((response) =>
          response.json()
        );
      },
      key: `twitch-user-${id}`,
      ttl: 1000 * 60 * 60 * 24
    });
    if (user) {
      profileImageUrl = user.profileImageUrl;
    }
  }

  return {
    id,
    profileImageUrl,
    roles: [
      meta.mod ? "MODERATOR" : null,
      meta.subscriber ? "SUBSCRIBER" : null,
      channel.replace("#", "").toLowerCase() ===
      meta["display-name"]?.toLowerCase()
        ? "BROADCASTER"
        : null
    ].filter(Boolean) as string[],
    username: meta["display-name"]
  };
};

export const parseEmotes = (
  message: string,
  emotesData: CommonUserstate["emotes"]
) => {
  // loop through each emote used in this message
  const emotes = Object.entries(emotesData || {}).map(([id, locationsRaw]) => {
    // turn the array of ranges into an array of arrays with start/end indices
    const locations = locationsRaw.map((l) => {
      const [start, end] = l.split("-");

      // for JS, substrings exclude the end index, so we need to bump by one
      return [parseInt(start), parseInt(end) + 1];
    });

    // get the start and end index for the first usage of this emote
    const [[start, end]] = locations;

    // pull out the emote name using the start and end indices
    const name = message.substring(start, end);

    const images: { [key: string]: string } = {
      large: `${TWITCH_CDN_URL}/${id}/3.0`,
      medium: `${TWITCH_CDN_URL}/${id}/2.0`,
      small: `${TWITCH_CDN_URL}/${id}/1.0`
    };

    return {
      id,
      images,
      locations,
      name
    };
  });

  return emotes;
};

// some emotes include special characters — :) — so we escape them in our regex
const escapeRegExSpecialChars = (string: string) => {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

export const getMessageHTML = (
  message: string,
  emotes: ReturnType<typeof parseEmotes>,
  size = "small"
) => {
  let html = message;

  emotes.forEach((emote) => {
    const img = `<img src="${emote.images[size]}" alt="${emote.name}" />`;
    const safeName = new RegExp(escapeRegExSpecialChars(emote.name), "g");
    html = html.replace(safeName, img);
  });

  return html;
};
