import Feedback from "../models/Feedback.js";
import {Order} from "../models/Order.js";
import { AdminDocument } from "../models/AdminDocument.js";
import { UserDocument } from "../models/UserDocument.js";
import { sendAfterAdminFeedback } from "../send-mail/(user)/on-admin-feedback.js";
import { onAdminDocumentUpload } from "../send-mail/(admin)/on-admin-document-upload.js";
import { onUserDocumentUpload } from "../send-mail/(admin)/on-user-document-upload.js";

export const addUserFeedback = async (req, res) => {
  try {
    const { orderId, message, feedbackType = "user", files } = req.body;

    if (!orderId || !message) {
      return res.status(400).json({ message: "orderId and message are required" });
    }

    // If you're using a numeric orderId
    const order = await Order.findOne({ orderId: Number(orderId) });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Use existing file _id's
    const documentIds = Array.isArray(files) ? files.map((f) => f._id) : [];

    const feedback = await Feedback.create({
      orderId: order._id, // Store ObjectId internally
      message,
      feedbackType,
      documents: documentIds,
    });
    await onUserDocumentUpload(feedback, orderId); // Notify admin of new document upload
    return res.status(201).json({
      message: "Feedback created successfully",
      feedback: {
        ...feedback.toObject(),
        documents: files, // Include file info for client display
      },
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addAdminFeedback = async (req, res) => {
  try {
    const { orderId, message, feedbackType = "admin", files } = req.body;

    if (!orderId || !message) {
      return res.status(400).json({ message: "orderId and message are required" });
    }

    // If you're using a numeric orderId
    const order = await Order.findOne({ orderId: Number(orderId) });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Use existing file _id's
    const documentIds = Array.isArray(files) ? files.map((f) => f._id) : [];

    const feedback = await Feedback.create({
      orderId: order._id, // Store ObjectId internally
      message,
      feedbackType,
      documents: documentIds,
    });

    await sendAfterAdminFeedback(orderId); // Send email after admin feedback is added
    await onAdminDocumentUpload(orderId); // Notify admin of new document upload
    return res.status(201).json({
      message: "Feedback created successfully",
      feedback: {
        ...feedback.toObject(),
        documents: files, // Include file info for client display
      },
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getFeedback = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "orderId are required" });
    }

    const order = await Order.findOne({ orderId: Number(orderId) });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const feedback = await Feedback.find({ orderId: order._id })
      .sort({ createdAt: 1 });
const populatedFeedbacks = await Promise.all(
  feedback.map(async (fb) => {
    let Model =  AdminDocument ;

    // Convert to plain object
    const feedbackObj = fb.toObject();

    // Replace documents with full objects
    feedbackObj.documents = await Model.find({ _id: { $in: fb.documents } });

    return feedbackObj;
  })
);
    return res.status(200).json({
      message: "Feedback fetch successfully",
      feedback: populatedFeedbacks
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMainAdminFeedback = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "orderId are required" });
    }

    const order = await Order.findOne({ orderId: Number(orderId) });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const feedback = await Feedback.findOne({ orderId: order._id, feedbackType: "admin" })
      .populate('documents')
      .sort({ createdAt: 1 });
    return res.status(200).json({
      message: "Feedback fetch successfully",
      feedback: feedback
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

