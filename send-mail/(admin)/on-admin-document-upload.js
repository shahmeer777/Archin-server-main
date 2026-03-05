// send-mail/architecht_uploads_document.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Order } from "../../models/Order.js";
import { User } from "../../models/User.js";

dotenv.config();

// 🔹 Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Build email template
const buildTemplate = (firstLastName, deliverableLink, orderid) => {
  const currentYear = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Livrable envoyé - Archinbox (Admin)</title>
  </head>
  <body style="margin:0; padding:0; background:#f5f4f2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center class="email-wrapper" style="width:100%; background:#f5f4f2; padding:28px 12px;">
      <table class="email-main" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px; margin:0 auto; background:#ffffff;">
        <!-- Header -->
        <tr>
          <td class="header" style="background:#D85A41; text-align:center; padding:26px 20px;">
            <img class="logo" src="https://projet.archinbox.fr/wp-content/uploads/2025/09/archinbox-header.png" alt="ARCHINBOX" style="max-height:56px; display:inline-block;">
          </td>
        </tr>
        <tr><td><hr class="header-divider" style="border-top:3px dashed #fff; margin:0;"></td></tr>

        <!-- Content -->
        <tr>
          <td class="content" style="padding:30px 34px 26px; color:#222; font-size:15px; line-height:1.5;">
            <p class="greeting" style="font-weight:700; font-size:18px; text-align:center; margin:0 0 18px;">Bonjour Archinbox team,</p>
            <p class="lead" style="margin:0 0 18px;">Vous venez d’envoyer le livrable du projet <strong>${firstLastName}</strong>.<br>
            Le client est notifié et invité à formuler ses retours.</p>

            <p class="section-title" style="color:#D85A41; font-weight:700; margin:18px 0 10px; font-size:15px; text-decoration: underline; text-underline-offset:5px;">Contenu livré :</p>
            <p class="bullet" style="margin:6px 0;">• Projet 3D</p>
            <p class="bullet" style="margin:6px 0;">• Recommandations techniques</p>

            <p class="section-title" style="color:#D85A41; font-weight:700; margin:18px 0 10px; font-size:15px; text-decoration: underline; text-underline-offset:5px;">Statut :</p>
            <p class="bullet" style="margin:6px 0;">En attente de feedback client.</p>

            <p style="text-align:center; margin:20px 0;">
              <a href="https://projet.archinbox.fr/livrables/?id=${orderid}" class="button" style="display:inline-block; background:#D85A41; color:#fff; padding:12px 22px; border-radius:6px; font-weight:700; font-size:16px; text-decoration:none;">
                Accéder au livrable ➔
              </a>
            </p>

            <hr class="dashed" style="border-top:2px dashed #000; margin:22px 0;">
          </td>
        </tr>

        <!-- Mascotte -->
        <tr>
          <td align="center" class="mascotte-wrap" style="padding:20px 0 8px;">
            <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png" alt="Mascotte Archinbox" class="mascotte" style="height:120px; margin:10px auto;">
          </td>
        </tr>

        <!-- Social Icons -->
        <tr>
          <td class="social-icons" style="text-align:center; padding:10px 0 4px;">
            <a href="https://archinbox.fr"><img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png" alt="Website" style="height:20px;"></a>
            <a href="https://www.instagram.com/archinbox_fr"><img
             src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-3.png" alt="Instagram" style="height:20px;"></a>
            <p style="text-align:center; color:#6b6b6b; font-size:13px; margin:18px 0;">
              <a href="mailto:contact@archinbox.fr" style="color:#D85A41; font-weight:700; text-decoration:none;">contact@archinbox.fr</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" class="footer-bar" style="background:#D85A41; color:#fff; font-size:14px;">
              <tr>
                <td align="left" style="font-weight:600; padding:15px 20px;">
                  ARCHINBOX © ${currentYear}
                </td>
                <td align="right" style="padding:15px 20px;">
                  <a href="https://archinbox.fr" style="text-decoration:none; color:#fff; margin-left:12px;">Website</a>
                  <a href="https://archinbox.fr/conditions-generales-de-vente" style="text-decoration:none; color:#fff; margin-left:12px;">CGV</a>
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
const sendAdminEmail = async (firstLastName, deliverableLink, orderid) => {
  try {
    const mailOptions = {
      from: `"ArchinBox" <${process.env.SMTP_USER}>`,
      to: "contact@archinbox.fr",
      subject: "📦 Livrable envoyé - Archinbox (Admin)",
      html: buildTemplate(firstLastName, deliverableLink, orderid),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin email sent for ${firstLastName}`);
  } catch (err) {
    console.error("❌ Failed to send admin email:", err);
  }
};

export const onAdminDocumentUpload = async (orderId) => {
  const order = await Order.findOne({ orderId: Number(orderId) });
  if (!order) return;
    // Step 2: Get the user based on order.userId
  const user = await User.findOne({ userId: order.userId });
  if (!user) return;
          const firstLastName = `${user.userName}`;
          const deliverableLink = `https://projet.archinbox.fr/dashboard`;
          const orderid = order.orderId;
          await sendAdminEmail(firstLastName, deliverableLink, orderid);
};




