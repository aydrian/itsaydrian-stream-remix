const { Router, json } = require("express");
const verifyTwitchSignature = require("../../middlewares/verifyTwitchSignature");
const twitchController = require("../../controllers/twitch.controller");
const router = new Router();

router.use(json({ verify: verifyTwitchSignature }));

router.post("/", twitchController.receiveWebhook);

module.exports = router;
