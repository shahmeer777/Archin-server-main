import dotenv from "dotenv";
dotenv.config();

import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

import { UploadedImage } from "../models/UploadedImage.js";
import { AdminDocument } from "../models/AdminDocument.js";
import { UploadedImageMode1 } from "../models/UploadedImageMode1.js";
import { UploadedImageCuisine } from "../models/UploadedImageCuisine.js";
import { UploadedImageChambreOui2 } from "../models/UploadedImageChambreOui2.js";
import { UploadedImageChambre2 } from "../models/UploadedImageChambre2.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Helper: Upload multiple files to S3 + save to DB
 */
async function uploadFilesToS3(files, folder, Model) {
  const uploadedFiles = [];

  for (const file of files) {
    if (!file.dataUrl) continue;

    const matches = file.dataUrl.match(/^data:(.+);base64,(.*)$/);
    if (!matches) continue;

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const ext = mimeType.split("/")[1] || "bin";
    const fileName = `${folder}/${uuidv4()}.${ext}`;

    // Upload to S3
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
      ContentDisposition: "inline",
    };

    const s3Result = await s3.upload(params).promise();

    // Save in DB
    const uploadedFile = await Model.create({
      name: file.name?.replace(/\.[^/.]+$/, "") || fileName,
      size: buffer.length,
      path: s3Result.Location,
      type: mimeType,
    });

    uploadedFiles.push(uploadedFile);
  }

  return uploadedFiles;
}

/**
 * 1) Upload files for Order (general)
 */
export const uploadOrderFiles = async (req, res) => {
  try {
    await Promise.race([
      (async () => {
        const { orderId } = req.params;
         const files = req.body;

        const user = await User.findOne({ userId: Number(orderId) });
        if (!user) return res.status(404).json({ message: "User not found" });

        const order = await Order.findOne({ userId: user.userId });
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (!Array.isArray(files) || files.length === 0) {
          return res.status(400).json({ message: "No files provided" });
        }

        const uploadedFiles = await uploadFilesToS3(files, "order-files", UploadedImage);

        order.uploaded_images.push(...uploadedFiles.map(f => f._id));
        await order.save();

        return res.status(201).json({ message: "Files uploaded", files: uploadedFiles });
      })(),
      req.timeoutPromise,
    ]);
  } catch (err) {
    if (err.message === "Request timed out") {
      return res.status(408).json({ message: "Request timed out" });
    }
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default uploadOrderFiles;

/**
 * 2) Upload admin docs
 */
export const uploadadminFiles = async (req, res) => {
  try {
        await Promise.race([
      (async () => {
    const files = req.body;


    if (!Array.isArray(files) || files.length === 0)
      return res.status(400).json({ message: "No files provided" });

    const uploadedFiles = await uploadFilesToS3(files, "admin-docs", AdminDocument);

    return res.status(201).json({ message: "Files uploaded", files: uploadedFiles });
          })(),
      req.timeoutPromise,
    ]);
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * 3) Upload user docs (same as admin docs, different endpoint)
 */
export const uploaduserFiles = uploadadminFiles;

/**
 * 4) Upload order phase2 files (mode1, cuisine, chambre, etc.)
 */
export const uploadOrderFilesMode1 = async (req, res) => {
  try {
        await Promise.race([
      (async () => {
    const { orderId } = req.params;
    const files = req.body;

    const user = await User.findOne({ userId: Number(orderId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = await Order.findOne({ userId: user.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!Array.isArray(files) || files.length === 0)
      return res.status(400).json({ message: "No files provided" });

    const uploadedFiles = await uploadFilesToS3(files, "order-mode1", UploadedImageMode1);

    order.phase_2.uploaded_images_mode1.push(...uploadedFiles.map((f) => f._id));
    await order.save();

    return res.status(201).json({ message: "Files uploaded (mode1)", files: uploadedFiles });
     })(),
      req.timeoutPromise,
    ]);
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const uploadOrderFilesCuisine = async (req, res) => {
  try {
        await Promise.race([
      (async () => {
    const { orderId } = req.params;
    const files = req.body;

    const user = await User.findOne({ userId: Number(orderId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = await Order.findOne({ userId: user.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!Array.isArray(files) || files.length === 0)
      return res.status(400).json({ message: "No files provided" });

    const uploadedFiles = await uploadFilesToS3(files, "order-cuisine", UploadedImageCuisine);

    order.phase_2.uploaded_images_cuisine.push(...uploadedFiles.map((f) => f._id));
    await order.save();

    return res.status(201).json({ message: "Files uploaded (cuisine)", files: uploadedFiles });
     })(),
      req.timeoutPromise,
    ]);
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const uploadOrderFilesChambreOui2 = async (req, res) => {
  try {
        await Promise.race([
      (async () => {
    const { orderId } = req.params;
    const files = req.body;

    const user = await User.findOne({ userId: Number(orderId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = await Order.findOne({ userId: user.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!Array.isArray(files) || files.length === 0)
      return res.status(400).json({ message: "No files provided" });

    const uploadedFiles = await uploadFilesToS3(files, "order-chambre-oui2", UploadedImageChambreOui2);

    order.phase_2.uploaded_images_chambre_oui2.push(...uploadedFiles.map((f) => f._id));
    await order.save();

    return res.status(201).json({ message: "Files uploaded (chambre_oui2)", files: uploadedFiles });
     })(),
      req.timeoutPromise,
    ]);
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const uploadOrderFilesChambre2 = async (req, res) => {
  try {
        await Promise.race([
      (async () => {
    const { orderId } = req.params;
    const files = req.body;

    const user = await User.findOne({ userId: Number(orderId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = await Order.findOne({ userId: user.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!Array.isArray(files) || files.length === 0)
      return res.status(400).json({ message: "No files provided" });
    const uploadedFiles = await uploadFilesToS3(files, "order-chambre2", UploadedImageChambre2);

    order.phase_2.uploaded_images_chambre2.push(...uploadedFiles.map((f) => f._id));
    await order.save();

    return res.status(201).json({ message: "Files uploaded (chambre2)", files: uploadedFiles });
     })(),
      req.timeoutPromise,
    ]);
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
