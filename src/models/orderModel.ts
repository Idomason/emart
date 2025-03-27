import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: {
      type: String,
      required: [true, "Order must have a description"],
    },
    quantity: { type: Number, required: [true, "Order quantity is required"] },
    status: {
      type: String,
      enum: ["review", "processing", "completed"],
      default: "review",
    },
    chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
