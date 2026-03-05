// 5_days_if_phase3_not_reviewed.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import  Feedback  from "../models/Feedback.js"; // 👈 Import Feedback schema
import { db } from "../config/database.js";

dotenv.config();

// 1️⃣ Transporter config
const transporter = nodemailer.createTransport({
  service: "gmail", // or use host/port if custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2️⃣ Build Email Template
const buildTemplate = (order, user) => {
 return `
<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#f4f4f4;">
      <tr>
        <td align="center" style="padding:20px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff; border-radius:4px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding:20px;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Marron-1.png" alt="ARCHINBOX" style="max-height:45px; height:auto; display:block;">
              </td>
            </tr>

            <tr>
              <td style="border-top:1px dashed #ccc; height:0; line-height:0; font-size:0;"></td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding:20px 30px; font-size:14px; color:#333; line-height:1.6;">
                <p style="font-weight:bold; font-size:20px; text-align:center; color:#333; margin:0 0 20px 0;">
                  Bonjour ${user.userName || "client"},
                </p>

                <p style="font-size:15px; margin:0 0 20px 0;">
                  Votre première proposition est <span style="color:#D85A41; font-weight:bold;">prête depuis quelques jours</span>, mais nous n'avons pas encore eu de retour de votre part.
                </p>

                <div style="background-color:#f8f9fa; padding:15px 20px; margin:20px 0; border-radius:4px; border-left:4px solid #D85A41;">
                  <p style="margin:0 0 10px 0;"><strong>Si vous avez la moindre question ou hésitation, n'hésitez pas à nous l'écrire.</strong></p>
                  <p style="margin:0;"><strong>Nous sommes là pour vous accompagner jusqu'au bout.</strong></p>
                </div>

                <div style="text-align:center; margin:30px 0;">
                  <a href="https://projet.archinbox.fr/login-screen/" 
                     style="background:#D85A41; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px; display:inline-block;">
                    Revoir ma proposition →
                  </a>
                </div>

                <div style="margin:25px 0; font-size:14px; line-height:1.6;">
                  <p style="margin:0 0 10px 0;"><strong>Besoin d'un échange en visio ?</strong></p>
                  <p style="margin:0;">Réservez un créneau avec l'un de nos architectes ici : 
                    <a href="https://calendly.com/archinbox/feedback-projet-archinbox" style="color:#D85A41; text-decoration:underline; font-weight:bold;">
                      https://calendly.com/archinbox/feedback-projet-archinbox
                    </a>
                  </p>
                </div>

                <p style="margin-top:30px;"><strong>À bientôt,</strong></p>
                <p style="color:#D85A41; font-style:italic;">Raphaëlle de ArchinBox</p>
              </td>
            </tr>

            <tr>
              <td style="border-top:1px dashed #ccc; height:0; line-height:0; font-size:0;"></td>
            </tr>

            <!-- Contact Info -->
            <tr>
              <td style="font-size:13px; text-align:center; color:#666; padding:20px 30px;">
                <p style="margin:0;">Si vous avez des questions, notre équipe reste disponible par email à 
                  <a href="mailto:contact@archinbox.fr" style="color:#D85A41; text-decoration:none; font-weight:bold;">contact@archinbox.fr</a>
                </p>
              </td>
            </tr>

            <!-- Mascotte -->
            <tr>
              <td align="center" style="padding:10px 0;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png" alt="Mascotte Archinbox" style="height:120px; display:block; margin:0 auto;">
              </td>
            </tr>

            <!-- Social Icons -->
            <tr>
              <td align="center" style="padding:10px 0;">
                <a href="#" style="margin:0 5px; text-decoration:none;"><img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png" alt="Website" style="height:14px;"></a>
                <a href="#" style="margin:0 5px; text-decoration:none;"><img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-3.png" alt="LinkedIn" style="height:14px;"></a>
                <a href="#" style="margin:0 5px; text-decoration:none;"><img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-4.png" alt="Facebook" style="height:14px;"></a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#D85A41; color:#fff; font-size:15px; padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="color:#fff; font-size:15px;">ARCHINBOX © ${new Date().getFullYear()}</td>
                    <td align="right">
                      <a href="#" style="color:#fff; text-decoration:none; margin-left:15px;">Website</a>
                      <a href="#" style="color:#fff; text-decoration:none; margin-left:15px;">CGV</a>
                      <a href="#" style="color:#fff; text-decoration:none; margin-left:15px;">CGU</a>
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
}

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

// 🔍 Find orders older than 5 days with no user feedback for phase 3
const getOrdersWithoutPhase3Review = async () => {
  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      "phase_3.createdAt": { $lte: fiveDaysAgo }, // phase 3 created at least 5 days ago
    }).populate("userId");

    const reminders = [];

    for (const order of orders) {
      const user = await User.findOne({ _id: order.userId });
      if (!user) continue;

      // check if user feedback exists
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

// 4️⃣ Exported reminder function (5 days interval)
export const reminder_5days = async () => {
  setInterval(() => {
    run();
  }, 5 * 24 * 60 * 60 * 1000); // 5 days in ms
};



