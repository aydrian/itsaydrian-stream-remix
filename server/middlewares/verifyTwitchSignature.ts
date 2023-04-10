import type { Request, Response } from "express";
import crypto from "crypto";
import invariant from "tiny-invariant";
import logger from "../utils/logger";

const twitchSigningSecret = process.env.TWITCH_SIGNING_SECRET;

const verifyTwitchSignature = (
  req: Request,
  _res: Response,
  buf: Buffer,
  _encoding: string
) => {
  const messageId = req.header("Twitch-Eventsub-Message-Id");
  invariant(typeof messageId === "string", "messageId expected to be a string");
  const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");
  invariant(typeof timestamp === "string", "timestamp expected to be a string");
  const messageSignature = req.header("Twitch-Eventsub-Message-Signature");
  const time = Math.floor(new Date().getTime() / 1000);

  if (Math.abs(time - parseInt(timestamp)) > 600) {
    // needs to be < 10 minutes
    logger.error(
      `Verification Failed: timestamp > 10 minutes. Message Id: ${messageId}.`
    );
    throw new Error("Ignore this request.");
  }

  if (!twitchSigningSecret) {
    logger.error(`Twitch signing secret is empty.`);
    throw new Error("Twitch signing secret is empty.");
  }

  const computedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", twitchSigningSecret)
      .update(messageId + timestamp + buf)
      .digest("hex");

  if (messageSignature !== computedSignature) {
    logger.error(
      `Verification Failed: Signature doesn't match. Message Id: ${messageId}. Sent: ${messageSignature}, Computed: ${computedSignature}`
    );
    throw new Error("Invalid signature.");
  }
};

export default verifyTwitchSignature;
