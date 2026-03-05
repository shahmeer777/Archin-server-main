import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Feedback from "../models/Feedback.js";
import { Order } from "../models/Order.js";

dotenv.config();

// 🔌 Connect DB
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

// 🔹 Setup Gmail transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Build client feedback template for admin
const buildAdminFeedbackTemplate = (feedback, order) => {
  const currentYear = new Date().getFullYear();
  const clientName = `${order.billing?.first_name || "Client"} ${order.billing?.last_name || ""}`.trim();
  const projectPieces = order.nb_pieces || "N/A";
  const projectStatus = order.statut_bien || "N/A";
  const feedbackMessage = feedback.message || "";

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Nouveau Feedback Client - Archinbox</title>
  </head>
  <body style="margin:0; padding:0; background:#f5f4f2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center class="email-wrapper" style="width:100%; padding:28px 12px;">
      <table class="email-main" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px; margin:0 auto; background:#ffffff;">
        <!-- Header -->
        <tr>
          <td class="header" style="background:#D85A41; text-align:center; padding:34px 20px 18px;">
            <img class="logo" src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Blanc.png" alt="ARCHINBOX" style="max-height:54px; display:inline-block;">
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="content" style="padding:30px 34px 26px; color:#222; font-size:15px; line-height:1.5;">
            <p class="greeting" style="font-weight:700; font-size:20px; text-align:center; margin:6px 0 18px;">
              Bonjour Archinbox team,
            </p>
            <p>Le client <strong>${clientName}</strong> vient de déposer un nouveau feedback sur son projet.</p>

            <p class="section-title" style="color:#D85A41; font-weight:700; margin:18px 0 10px; font-size:15px; text-decoration: underline;">
              Message client :
            </p>
            <p>"${feedbackMessage}"</p>

            <p class="section-title" style="color:#D85A41; font-weight:700; margin:18px 0 10px; font-size:15px; text-decoration: underline;">
              Détails projet :
            </p>
            <p class="bullet" style="margin:6px 0;">• Pièce(s) à rénover : <strong>${projectPieces}</strong></p>
            <p class="bullet" style="margin:6px 0;">• Statut projet : <strong>${projectStatus}</strong></p>

            <p style="text-align:center; margin:20px 0;">
              <a href="https://projet.archinbox.fr/admin/project/${order._id}" style="display:inline-block; background:#D85A41; color:#fff; padding:12px 22px; border-radius:6px; font-weight:700; font-size:16px; text-decoration:none;">
                Voir le projet
              </a>
            </p>

            <hr style="border-top:2px dashed #000; margin:22px 0;">
          </td>
        </tr>

        <!-- Mascotte -->
        <tr>
          <td align="center" style="padding:22px 0 6px;">
            <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png" alt="Mascotte Archinbox" style="height:120px; margin:15px auto;">
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#D85A41; color:#fff; font-size:14px;">
              <tr>
                <td align="left" style="font-weight:600; padding:15px 20px;">
                  ARCHINBOX © ${currentYear}
                </td>
                <td align="right" style="padding:15px 20px;">
                  <a href="https://projet.archinbox.fr" style="color:#fff; margin-left:12px;">Website</a>
                  <a href="https://projet.archinbox.fr/conditions-generales-de-vente" style="color:#fff; margin-left:12px;">CGV</a>
                  <a href="https://projet.archinbox.fr/conditions-generales-dutilisation" style="color:#fff; margin-left:12px;">CGU</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
  </html>
  `;
};

// 🔹 Send email to admin
const sendAdminEmail = async (feedback, order) => {
  try {
    const mailOptions = {
      from: `"ArchinBox" <${process.env.EMAIL_USER}>`,
      to: "contact@archinbox.fr", // admin email
      subject: `📢 Nouveau feedback client: ${order.billing?.first_name || "Client"} ${order.billing?.last_name || ""}`,
      html: buildAdminFeedbackTemplate(feedback, order),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Admin notified. Email info:", info);
  } catch (err) {
    console.error("❌ Failed to send admin email:", err.message);
  }
};

// 🔍 Watch for new user feedback
export const watchUserFeedback = async () => {
  await connectDB();
  try {
    const changeStream = Feedback.watch();

    changeStream.on("change", async (change) => {
      if (change.operationType === "insert") {
        const feedback = change.fullDocument;
        if (feedback.feedbackType === "user") {
          const order = await Order.findById(feedback.orderId);
          if (!order) return;

          await sendAdminEmail(feedback, order);
        }
      }
    });

    console.log("👀 Watching Feedback collection for user feedback...");
  } catch (err) {
    console.error("❌ Feedback watcher failed:", err.message);
  }
};

// 🔹 Start watching
export const user_feedback = async () => {
  await connectDB();
  await watchUserFeedback();
};
