import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    feedbackType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UploadedImage",
      },
    ],
  },
  { timestamps: false }
);

export default mongoose.model("Feedback", feedbackSchema);
