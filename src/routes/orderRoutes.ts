import express from "express";
import { authenticate } from "../middlewares/auth";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  updateOrder,
  updateOrderStatus,
} from "../controllers/orderController";

const router = express.Router();

router
  .route("/")
  .get(authenticate("admin"), getAllOrders)
  .post(authenticate(), createOrder);

router
  .route("/:id")
  .patch(authenticate("admin"), updateOrder)
  .delete(authenticate("admin"), deleteOrder);

router.patch("/:id/status", authenticate("admin"), updateOrderStatus);

router.get("/my-orders", authenticate(), getMyOrders);

export default router;
