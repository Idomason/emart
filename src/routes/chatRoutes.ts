import express from "express";
import { authenticate } from "../middlewares/auth";
import { getChatMessages, closeChatRoom } from "../controllers/chatController";

const router = express.Router();

router.get("/:orderId", authenticate(), getChatMessages);
router.post("/:orderId/close", authenticate("admin"), closeChatRoom);

export default router;
