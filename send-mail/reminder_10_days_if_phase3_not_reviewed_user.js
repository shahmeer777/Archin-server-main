// reminder_after_10days_if_phase3_not_reviewed.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import Feedback from "../models/Feedback.js"; // 👈 Import Feedback schema
import { db } from "../config/database.js";

dotenv.config();

// 1️⃣ Transporter config
const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2️⃣ Build Email Template
const buildTemplate = (order, user) => {
  const firstName = user.userName || "client";
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>N'oubliez pas de valider votre phase 3</title>
</head>
<body class="email-container" style="margin:0; padding:0; background:#f4f4f4;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" bgcolor="#f4f4f4">
    <tr>
      <td align="center">
        
        <table border="0" cellspacing="0" cellpadding="0" class="main-table" align="center" style="background:#fff; border-radius:4px; max-width:600px; width:100%;">
          
          <tr>
            <td class="header-section" style="text-align:center; padding:20px;">
              <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Marron-1.png" alt="ARCHINBOX" class="logo" style="max-height:45px;">
            </td>
          </tr>
          <tr><td class="divider" style="border-top:1px dashed #ccc;"></td></tr>

          <tr>
            <td class="content-section" style="padding:25px 30px; font-size:15px; color:#333; line-height:1.6;">
              <p class="greeting" style="font-size:20px; font-weight:bold; margin-bottom:20px;">Bonjour ${firstName},</p>

              <p>Il y a maintenant <span style="color:#D85A41; font-weight:bold;">10 jours</span> que nous vous avons envoyé votre <strong>phase 3</strong>, et nous n’avons pas encore eu de retour de votre part.</p>

              <div class="reminder-box" style="background:#f8f9fa; border-left:4px solid #D85A41; padding:15px 20px; border-radius:4px; margin:20px 0;">
                <p><strong>Valider cette étape est essentiel pour avancer sur votre projet et respecter le planning prévu.</strong></p>
                <p>Nous restons bien sûr disponibles pour répondre à vos questions.</p>
              </div>

              <div class="cta-container" style="text-align:center; margin:30px 0;">
                <a href="https://projet.archinbox.fr/login-screen/" class="cta-button" style="display:inline-block; background:#D85A41; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px;">Revoir ma phase 3 →</a>
              </div>

              <p style="margin-top:30px;"><strong>À très vite,</strong></p>
              <p style="color:#D85A41; font-style:italic;">Raphaëlle de ArchinBox</p>
            </td>
          </tr>

          <tr><td class="divider" style="border-top:1px dashed #ccc;"></td></tr>

          <tr>
            <td class="contact-info" style="font-size:13px; text-align:center; color:#666; padding:15px 30px;">
              <p>Des questions ? Écrivez-nous à <a href="mailto:contact@archinbox.fr" style="color:#D85A41; font-weight:bold;">contact@archinbox.fr</a></p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:10px 0;">
              <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png" alt="Mascotte Archinbox" style="height:120px; display:block; margin:0 auto;">
            </td>
          </tr>

          <tr>
            <td class="social-icons" style="text-align:center; padding:10px 0;">
              <a href="#"><img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png" alt="Website" style="height:14px;"></a>
              <a href="#"><img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-3.png" alt="LinkedIn" style="height:14px;"></a>
              <a href="#"><img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-4.png" alt="Facebook" style="height:14px;"></a>
            </td>
          </tr>

          <tr>
            <td class="footer-bar" style="background:#D85A41; color:#fff; font-size:14px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="footer-content" align="left" style="padding:20px;">ARCHINBOX © ${currentYear}</td>
                  <td class="footer-content" align="right" style="padding:20px;">
                    <a href="#" style="color:#fff; margin-left:15px; text-decoration:none;">Website</a>
                    <a href="#" style="color:#fff; margin-left:15px; text-decoration:none;">CGV</a>
                    <a href="#" style="color:#fff; margin-left:15px; text-decoration:none;">CGU</a>
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
</html>
`;
};

// 3️⃣ Send emails
const sendEmails = async (recipients) => {
  for (const recipient of recipients) {
    try {
      const info = await transporter.sendMail({
        from: `"Archinbox" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: "Rappel : Merci de valider la phase 3 de votre projet",
        html: buildTemplate(recipient.order, recipient.user),
      });
      console.log(`✅ Email sent to ${recipient.email}: ${info.messageId}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${recipient.email}:`, err.message);
    }
  }
};

// 🔍 Find orders older than 10 days with no user feedback for phase 3
const getOrdersWithoutPhase3Review = async () => {
  try {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      "phase_3.createdAt": { $lte: tenDaysAgo }, // created at least 10 days ago
    }).populate("userId");

    const reminders = [];

    for (const order of orders) {
      const user = await User.findOne({ _id: order.userId });
      if (!user) continue;

      const feedback = await Feedback.findOne({
        orderId: order._id,
        feedbackType: "user",
      });

      if (!feedback) {
        reminders.push({
          email: user.userEmail,
          user,
          order,
        });
      }
    }

    console.log("📧 Reminders to send:", reminders);
    await sendEmails(reminders);
    return reminders;
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return [];
  }
};

// Run once
const run = async () => {
  if (!db.isReady()) {
    await db.connect();
  }
  
  try {
    await getOrdersWithoutPhase3Review();
  } catch (err) {
    console.error("❌ run() error:", err.message);
  }
};

// 4️⃣ Exported reminder function (10 days interval)
export const reminder_10days = async () => {
  setInterval(() => {
    run();
  }, 10 * 24 * 60 * 60 * 1000); // 10 days in ms
};
