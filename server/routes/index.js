const { Router } = require("express");
const webhookRoutes = require("./webhooks");
const router = new Router();

router.use("/webhooks", webhookRoutes);

module.exports = router;
