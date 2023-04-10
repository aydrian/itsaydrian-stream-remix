import type { Request, Response, NextFunction } from "express";
import { pubsub, CHANNELS } from "../pub-sub";
import pino from "../utils/logger";
const { info, error } = pino;
import { MessageTypes, NotificationTypes } from "../utils/twitch.helpers";

async function receiveWebhook(req: Request, res: Response, next: NextFunction) {
  const messageType = req.header("Twitch-Eventsub-Message-Type");
  info({ messageType });
  try {
    if (messageType === MessageTypes.CALLBACK_VERIFICATION) {
      info("Verifying Webhook");
      return res.status(200).send(req.body.challenge);
    } else if (messageType === MessageTypes.REVOCATION) {
      const { subscription } = req.body;
      info("Revocation Request", subscription);
      pubsub.publish(CHANNELS.EVENTSUB.REVOCATION, { subscription });
    } else if (messageType === MessageTypes.NOTIFICATION) {
      const {
        event,
        subscription: { type }
      } = req.body;

      info(
        `Receiving ${type} request for ${event.broadcaster_user_name}: `,
        event
      );
      if (type === NotificationTypes.CHANNEL.FOLLOW) {
        pubsub.publish(CHANNELS.EVENTSUB.CHANNEL.FOLLOW, { event });
      } else if (type === NotificationTypes.CHANNEL.REDEEM_CUSTOM_REWARD) {
        pubsub.publish(CHANNELS.EVENTSUB.CHANNEL.REDEEM_CUSTOM_REWARD, {
          event
        });
      } else if (type === NotificationTypes.CHANNEL.SUBSCRIBE) {
        pubsub.publish(CHANNELS.EVENTSUB.CHANNEL.SUBSCRIBE, { event });
      } else if (type === NotificationTypes.STREAM.OFFLINE) {
        pubsub.publish(CHANNELS.EVENTSUB.STREAM.OFFLINE, { event });
      } else if (type === NotificationTypes.STREAM.ONLINE) {
        pubsub.publish(CHANNELS.EVENTSUB.STREAM.ONLINE, { event });
      } else {
        info(`Type ${type} not supported.`);
      }
    }

    res.status(200).end();
  } catch (err) {
    let message;
    if (err instanceof Error) message = err.message;
    else message = String(error);
    error(`Error while processing EventSub Webhook.`, message);
    next(err);
  }
}

export default { receiveWebhook };
