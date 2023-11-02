import { rehype } from "rehype";
import sanitize from "rehype-sanitize";
import { type ChatUserstate, type CommonUserstate } from "tmi.js";

import { getTwitchUser } from "~/utils/twitch.server";

// https://dev.twitch.tv/docs/irc/emotes/#cdn-template
const TWITCH_CDN_URL = "https://static-cdn.jtvnw.net/emoticons/v2";

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
    const user = await getTwitchUser(id);
    if (user) {
      profileImageUrl = user.profilePictureUrl;
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
      large: `${TWITCH_CDN_URL}/${id}/default/light/3.0`,
      medium: `${TWITCH_CDN_URL}/${id}/default/light/2.0`,
      small: `${TWITCH_CDN_URL}/${id}/default/light/1.0`
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
  console.log({ before: html });

  html = formatUserMentions(html);

  console.log({ after: html });

  emotes.forEach((emote) => {
    const img = `<img alt="${emote.name}" class="inline-block" src="${emote.images[size]}" />`;
    const safeName = new RegExp(escapeRegExSpecialChars(emote.name), "g");
    html = html.replace(safeName, img);
  });

  const sanitizedHtml = rehype()
    .data("settings", { fragment: true })
    .use(sanitize, {
      attributes: {
        "*": ["alt", "className"],
        img: ["src"]
      },
      protocols: {
        src: ["https"]
      },
      strip: ["script"],
      tagNames: ["img", "mark", "marquee"]
    })
    .processSync(html)
    .toString();

  return sanitizedHtml;
};

function formatUserMentions(messageContents: string) {
  return messageContents.replace(
    /@([\w]+)/g,
    function (substring, mentionedUser) {
      return `<mark class="font-semibold">@${mentionedUser}</mark>`;
    }
  );
}
