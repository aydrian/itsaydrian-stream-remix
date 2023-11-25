import type { LoaderFunctionArgs } from "@remix-run/node";

import { toast } from "react-toastify";
import { useEventSource } from "remix-utils/sse/react";
import { eventStream } from "remix-utils/sse/server";
import { Client, type Events } from "tmi.js";

import {
  getMessageHTML,
  parseAuthor,
  parseCommand,
  parseEmotes
} from "~/utils/parse-chat.server";

type CommonMessage = {
  author: Awaited<ReturnType<typeof parseAuthor>>;
  emotes: ReturnType<typeof parseEmotes>;
  id?: string;
  message: string;
  time: Date;
  type: "chat" | "command";
};
export type ChatMessage = CommonMessage & { html: string };
export type CommandMessage = CommonMessage & {
  args: string[];
  command: string;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { channel } = params;
  if (!channel) {
    throw new Response(null, { status: 400, statusText: "Bad Request" });
  }
  return eventStream(request.signal, function setup(send) {
    const client = new Client({
      channels: [channel],
      connection: { reconnect: true, secure: true }
    });

    client.connect().catch((err) => {
      console.log(`Error Connecting to ${channel} chat.`, { err });
    });

    const listener: Events["action"] = async (channel, tags, msg, self) => {
      // don’t process messages sent by the chatbot to avoid loops
      if (self) {
        return;
      }

      if (tags["message-type"] === "whisper") {
        // we don’t handle whispers
        return;
      }

      const time = tags["tmi-sent-ts"]
        ? new Date(parseInt(tags["tmi-sent-ts"]))
        : new Date();

      const commonMessage: CommonMessage = {
        author: await parseAuthor(channel, tags),
        emotes: parseEmotes(msg, tags.emotes),
        id: tags.id,
        message: msg,
        time,
        type: "chat"
      };

      if (msg.match(/^(!|--)/)) {
        const command: CommandMessage = {
          ...commonMessage,
          ...parseCommand(channel),
          type: "command"
        };

        return send({ data: JSON.stringify(command), event: "new-chat" });
      }

      const chat: ChatMessage = {
        ...commonMessage,
        html: getMessageHTML(msg, commonMessage.emotes)
      };

      return send({ data: JSON.stringify(chat), event: "new-chat" });
    };

    client.on("message", listener);

    return function clear() {
      client.removeListener("message", listener);
      client.disconnect();
    };
  });
}

export function ChatNotification({
  ChatComponent,
  CommandComponent,
  channel
}: {
  ChatComponent?: React.ComponentType<{ message: ChatMessage }>;
  CommandComponent?: React.ComponentType<{ message: CommandMessage }>;
  channel: string;
}) {
  const eventMessage = useEventSource(`/resources/twitch/chat/${channel}`, {
    event: "new-chat"
  });
  const commonMessage = eventMessage
    ? (JSON.parse(eventMessage) as CommonMessage)
    : undefined;

  if (ChatComponent && commonMessage?.type === "chat") {
    const chatMessage = commonMessage as ChatMessage;
    toast(<ChatComponent message={chatMessage} />, {
      // autoClose: false,
      closeButton: false,
      position: "bottom-right",
      theme: "light"
    });
  } else if (CommandComponent && commonMessage?.type === "command") {
    const commandMessage = commonMessage as CommandMessage;
    toast(<CommandComponent message={commandMessage} />, {
      // autoClose: false,
      closeButton: false,
      position: "bottom-right",
      theme: "light"
    });
  }
  return null;
}
