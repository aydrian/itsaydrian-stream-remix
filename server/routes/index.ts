import { Router } from "express";
import webhookRoutes from "./webhooks";
const router = Router();

router.use("/webhooks", webhookRoutes);

export default router;
