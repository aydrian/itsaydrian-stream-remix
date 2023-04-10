import { Router, json } from "express";
import verifyTwitchSignature from "../../middlewares/verifyTwitchSignature";
import twitchController from "../../controllers/twitch.controller";
const router = Router();

router.use(json({ verify: verifyTwitchSignature }));

router.post("/", twitchController.receiveWebhook);

export default router;
