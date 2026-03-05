// project_delivery_user.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Order } from "../../models/Order.js";
import { User } from "../../models/User.js";

dotenv.config();

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
    user?.userName?.split?.(" ")?.[0] ||
    "Client";

  // Determine calendar link: prefer order's calendly if present, otherwise the public feedback calendly
  const calendlyFromOrder =
    order?.phase_2?.content?.calendlyEvent?.event?.uri || null;
  const calendlyLink =
    calendlyFromOrder || "https://calendly.com/archinbox/feedback-projet-archinbox";
  const url = order?.orderId 
  ? `https://projet.archinbox.fr/livrables/?id=${order.orderId}` 
  : 'https://projet.archinbox.fr/login-screen/';
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
                <a href="${url}" style="display:inline-block;background:#D85A41;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700;">
                  Découvrir mon projet →
                </a>
              </div>

              <div style="margin:18px 0;padding:14px;background:#f7f7f7;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:700;">Besoin d'un échange en visio ?</p>
                <p style="margin:0;">
                  Réservez un créneau ici : 
                  <a href="https://calendly.com/archinbox/feedback-projet-archinbox" style="color:#D85A41;text-decoration:underline;font-weight:700;" target="_blank">https://calendly.com/archinbox/feedback-projet-archinbox</a>
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
                    <a href="https://archinbox.fr" style="color:#fff;text-decoration:none;margin-left:12px;">Website</a>
                    <a href="https://archinbox.fr/conditions-generales-de-vente" style="color:#fff;text-decoration:none;margin-left:12px;">CGV</a>
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
// Main exported function
// ------------------
export const sendAfterAdminFeedback = async (orderId) => {
  try {
    // 1️⃣ Find order
    const order = await Order.findOne({ orderId: Number(orderId) }).lean();
    if (!order) {
      console.warn(`⚠️ Order not found for orderId: ${orderId}`);
      return false;
    }

    // 2️⃣ Find user
    const user = await User.findOne({ userId: Number(order.userId) }).lean();
    if (!user) {
      console.warn(`⚠️ User not found for userId: ${order.userId}`);
      return false;
    }

    console.log("👤 User found:", user);

    // 3️⃣ Send the email using your existing helper
    const success = await sendProjectDeliveryEmail({ order, user });

    return success;
  } catch (err) {
    console.error("❌ Error in sendAfterAdminFeedback:", err.message);
    return false;
  }
};


