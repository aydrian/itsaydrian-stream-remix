const { Router } = require("express");
const twitchRoutes = require("./twitch");
const router = new Router();

router.use("/twitch", twitchRoutes);

module.exports = router;
