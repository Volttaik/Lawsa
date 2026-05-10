import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import postsRouter from "./posts.js";
import messagesRouter from "./messages.js";
import clansRouter from "./clans.js";
import notificationsRouter from "./notifications.js";
import storeRouter from "./store.js";
import callsRouter from "./calls.js";
import uploadRouter from "./upload.js";
import stickersRouter from "./stickers.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(messagesRouter);
router.use(clansRouter);
router.use(notificationsRouter);
router.use(storeRouter);
router.use(callsRouter);
router.use(uploadRouter);
router.use(stickersRouter);

export default router;
