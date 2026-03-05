// project_delivery_user.js
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Feedback from "../models/Feedback.js"; // default export in your feedback.js
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

dotenv.config();

// ------------------
// Connect DB
// ------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// ------------------
// Transporter
// ------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ------------------
// Template builder (inline styles)
// ------------------
const buildProjectDeliveryTemplate = ({ order, user }) => {
  const currentYear = new Date().getFullYear();
  const firstName =
    order?.billing?.first_name ||
    user?.userName?.split?.(" ")?.[0] ||
    "Client";

  // Determine calendar link: prefer order's calendly if present, otherwise the public feedback calendly
  const calendlyFromOrder =
    order?.phase_2?.content?.calendlyEvent?.event?.uri || null;
  const calendlyLink =
    calendlyFromOrder || "https://calendly.com/archinbox/feedback-projet-archinbox";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Votre proposition Archinbox est arrivée !</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:6px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:20px;text-align:center;background:#fff;">
              <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Marron-1.png" alt="ARCHINBOX" style="max-height:45px; display:block; margin:0 auto;">
            </td>
          </tr>

          <tr><td style="border-top:1px dashed #ccc;"></td></tr>

          <!-- Content -->
          <tr>
            <td style="padding:22px 30px;color:#333;line-height:1.5;font-size:14px;">
              <p style="margin:0 0 12px;font-weight:700;font-size:18px;text-align:center;">Bonjour ${firstName},</p>

              <p style="margin:12px 0;color:#333;font-size:15px;">
                <span style="color:#D85A41;font-weight:700;">Votre première proposition d'aménagement est prête</span> et vous attend dans votre espace Archinbox.
              </p>

              <div style="background:#f8f9fa;padding:14px;border-radius:6px;margin:16px 0;border-left:4px solid #D85A41;">
                <p style="margin:0 0 10px;font-weight:700;color:#D85A41;">Elle inclut :</p>
                <ul style="margin:0;padding-left:18px;color:#333;">
                  <li>Une modélisation 3D réaliste de votre pièce (ou pièces) sélectionnée(s)</li>
                  <li>Un agencement pensé selon vos contraintes et vos inspirations</li>
                  <li>Une ambiance architecturale cohérente avec votre style</li>
                  <li>Nos premières suggestions techniques et fonctionnelles</li>
                </ul>
              </div>

              <p style="margin:12px 0;color:#333;">Vous pouvez dès maintenant consulter le projet, nous faire part de vos retours et ajouter des remarques si nécessaire.</p>

              <div style="text-align:center;margin:20px 0;">
                <a href="${process.env.CLIENT_APP_URL || "https://projet.archinbox.fr/login-screen/"}" style="display:inline-block;background:#D85A41;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700;">
                  Découvrir mon projet →
                </a>
              </div>

              <div style="margin:18px 0;padding:14px;background:#f7f7f7;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:700;">Besoin d'un échange en visio ?</p>
                <p style="margin:0;">
                  Réservez un créneau ici : 
                  <a href="${calendlyLink}" style="color:#D85A41;text-decoration:underline;font-weight:700;" target="_blank">${calendlyLink}</a>
                </p>
              </div>

              <p style="margin-top:18px;"><strong>À bientôt,</strong></p>
              <p style="margin:6px 0 0;color:#D85A41;font-style:italic;">Raphaëlle de ArchinBox</p>
            </td>
          </tr>

          <tr><td style="border-top:1px dashed #ccc;"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="background:#D85A41;color:#fff;padding:14px 20px;font-size:13px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left">ARCHINBOX © ${currentYear}</td>
                  <td align="right">
                    <a href="https://projet.archinbox.fr" style="color:#fff;text-decoration:none;margin-left:12px;">Website</a>
                    <a href="https://projet.archinbox.fr/conditions-generales-de-vente" style="color:#fff;text-decoration:none;margin-left:12px;">CGV</a>
                    <a href="https://projet.archinbox.fr/conditions-generales-dutilisation" style="color:#fff;text-decoration:none;margin-left:12px;">CGU</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};


// ------------------
// Send email function
// ------------------
const sendProjectDeliveryEmail = async ({ order, user, feedback }) => {
  try {
    const targetEmail = order?.billing?.email || user?.userEmail;
    if (!targetEmail) {
      console.warn("⚠️ No recipient email for order:", order?._id);
      return false;
    }

    const html = buildProjectDeliveryTemplate({ order, user, feedback });

    await transporter.sendMail({
      from: `"Archinbox" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: "Votre proposition Archinbox est arrivée !",
      html,
    });

    console.log(`📧 Project delivery email sent to ${targetEmail} for order ${order._id}`);
    // mark order so we don't resend
    await Order.findByIdAndUpdate(order._id, { projectDeliveryMailSent: true }, { new: true })
      .catch((err) => console.error("❌ Failed to mark order projectDeliveryMailSent:", err.message));
    return true;
  } catch (err) {
    console.error("❌ Failed to send project delivery email:", err.message);
    return false;
  }
};

// ------------------
// Initial catch-up: find admin feedbacks with docs and send if order not yet marked
// ------------------

const checkExistingAdminFeedbacks = async () => {
  try {
    // find admin feedbacks that have documents
    const adminFeedbacks = await Feedback.find({
      feedbackType: "admin",
      documents: { $exists: true, $ne: [] },
    }).lean();

    console.log(`🔍 Found ${adminFeedbacks.length} admin feedback(s) with documents (catch-up)`);

    for (const fb of adminFeedbacks) {
      // fetch order
      const order = await Order.findById(fb.orderId).lean();
      if (!order) {
        console.warn("⚠️ Order not found for feedback:", fb._id, "orderId:", fb.orderId);
        continue;
      }
      // skip if already sent
      if (order.projectDeliveryMailSent) {
        console.log(`ℹ️ Skipping order ${order._id} (projectDeliveryMailSent already true)`);
        continue;
      }

      // fetch user
      const user = await User.findOne({ userId: order.userId }).lean();
      // Resolve full documents objects for email (Feedback.documents currently holds references)
      // If docs are populated in feedback, use them; otherwise fetch them
      let populatedFeedback = fb;
      if (!fb.documents || (Array.isArray(fb.documents) && fb.documents.length && typeof fb.documents[0] === "string")) {
        // attempt to populate by querying AdminDocument collection via model name 'AdminDocument' if necessary
        // but simpler: try to re-query feedback with populate if available
        populatedFeedback = await Feedback.findById(fb._id).populate("documents").lean();
      }

      console.log(`📩 Sending project delivery for order ${order._id} (feedback ${fb._id}) to ${user?.userEmail || order.billing?.email}`);
      await sendProjectDeliveryEmail({ order, user, feedback: populatedFeedback });
    }
  } catch (err) {
    console.error("❌ Error in checkExistingAdminFeedbacks:", err.message);
  }
};

// ------------------
// Watch for new admin feedback inserts (realtime)
// ------------------

const watchFeedbacks = async () => {
  try {
    const changeStream = Feedback.watch();

    changeStream.on("change", async (change) => {
      try {
        if (change.operationType === "insert") {
          const fb = change.fullDocument;
          if (!fb) return;

          if (fb.feedbackType === "admin" && Array.isArray(fb.documents) && fb.documents.length > 0) {
            console.log("📥 New admin feedback with docs detected:", fb._id);

            const order = await Order.findById(fb.orderId).lean();
            if (!order) {
              console.warn("⚠️ Order not found for feedback:", fb._id);
              return;
            }

            const user = await User.findOne({ userId: order.userId }).lean();
            await sendProjectDeliveryEmail({ order, user });
          }
        }
      } catch (innerErr) {
        console.error("❌ Error processing change stream event:", innerErr.message);
      }
    });

    console.log("👀 Watching feedbacks collection for new admin uploads...");
  } catch (err) {
    console.error("❌ Failed to open feedback change stream:", err.message);
  }
};

// ------------------
// Main exported function
// ------------------
export const project_delivery_user = async () => {
  await connectDB();
  await checkExistingAdminFeedbacks(); // ✅ catch-up for existing admin feedbacks with docs
  await watchFeedbacks(); // 🚀 only watch for new events, no catch-up
};


