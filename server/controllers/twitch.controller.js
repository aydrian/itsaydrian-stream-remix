const { pubsub, CHANNELS } = require("../pub-sub");
const logger = require("../utils/logger");
const { MessageTypes, NotificationTypes } = require("../utils/twitch.helpers");

async function receiveWebhook(req, res, next) {
  const messageType = req.header("Twitch-Eventsub-Message-Type");
  logger.info({ messageType });
  try {
    if (messageType === MessageTypes.CALLBACK_VERIFICATION) {
      logger.info("Verifying Webhook");
      return res.status(200).send(req.body.challenge);
    } else if (messageType === MessageTypes.REVOCATION) {
      const { subscription } = req.body;
      logger.info("Revocation Request", subscription);
      pubsub.publish(CHANNELS.EVENTSUB.REVOCATION, { subscription });
    } else if (messageType === MessageTypes.NOTIFICATION) {
      const {
        event,
        subscription: { type }
      } = req.body;

      logger.info(
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
        logger.info(`Type ${type} not supported.`);
      }
    }

    res.status(200).end();
  } catch (err) {
    logger.error(`Error while processing EventSub Webhook.`, err.message);
    next(err);
  }
}

module.exports = { receiveWebhook };
