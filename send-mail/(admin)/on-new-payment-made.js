// new_estimation_admin.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Build Admin Payment Template
const buildPaymentTemplate = (order, user) => {
  const currentYear = new Date().getFullYear();
  const orderDate = order.date
    ? new Date(order.date).toLocaleDateString("fr-FR")
    : "N/A";

  const customerName =
    user?.userName ||
    "N/A";

  const customerEmail =
  user?.userEmail || "N/A";

  // ✅ Montant réglé
  const amountPaid = order.total
    ? `${Number(order.total).toLocaleString("fr-FR", {
        style: "currency",
        currency: order.currency || "EUR"
      })}`
    : "N/A";

  // ✅ Méthode de paiement
  // WooCommerce usually provides `payment_method_title`, 
  // but your schema doesn’t store it. 
  // If you add it to schema, use `order.payment_method_title`.
  // For now fallback:
  const paymentMethod = order.payment_method_title || "Stripe ";

  const surface = order.surface_interieure || "N/A";
  const espaces = order.espaces?.map(e => e.value).join(", ") || "N/A";

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Nouveau paiement - Archinbox (Admin)</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td align="center" style="padding:20px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#D85A41; text-align:center; padding:30px 20px;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/archinbox-header.png" 
                     alt="ARCHINBOX" style="max-height:45px;">
              </td>
            </tr>

            <tr><td style="height:2px; background:#eaeaea;"></td></tr>

            <!-- Content -->
            <tr>
              <td style="padding:30px 40px; font-size:14px; line-height:1.6;">
                <p style="font-size:18px; font-weight:bold; margin:0 0 16px;">Bonjour Archinbox team,</p>
                <p style="margin:0 0 12px;">Un client a validé son projet Archinbox via un paiement en ligne.</p>
                <p style="margin:0 0 20px;">Le traitement peut démarrer dès maintenant.</p>

                <p style="color:#D85A41; font-weight:bold; margin:18px 0 8px; font-size:16px;">Informations client :</p>
                <p style="margin:0 0 16px;">
                  • Nom : <strong>${customerName}</strong><br>
                  • Email : <strong>${customerEmail}</strong><br>
                  • Date : <strong>${orderDate}</strong>
                </p>

                  <p style="color:#D85A41; font-weight:bold; margin:18px 0 8px; font-size:16px;">Détails de la commande :</p>
    <p style="margin:0 0 16px;">
      • Montant réglé : <strong>${amountPaid}</strong><br>
      • Méthode de paiement : <strong>${paymentMethod}</strong><br>
      • Surface commandée : <strong>${surface} m²</strong><br>
      • Pièce(s) à rénover : <strong>${espaces}</strong>
    </p>

                <p style="color:#D85A41; font-weight:bold; margin:18px 0 8px; font-size:16px;">Statut projet :</p>
                <p><strong>Accès débloqué au questionnaire détaillé</strong></p>

                <div style="text-align:center; margin:30px 0;">
                  <a href="${`https://projet.archinbox.fr/dashboard-2/?id=${order.orderId}`}" 
                     style="display:inline-block; background:#D85A41; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px;">
                    Accéder au fichier client →
                  </a>
                </div>
              </td>
            </tr>

            <tr><td style="height:2px; background:#eaeaea;"></td></tr>

            <!-- Mascotte -->
            <tr>
              <td align="center" style="padding:15px 0;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png" 
                     alt="Mascotte Archinbox" style="max-height:120px;">
              </td>
            </tr>

            <!-- Contact Info -->
            <tr>
              <td style="font-size:13px; text-align:center; padding:20px 30px; color:#666;">
                Si vous avez des questions, notre équipe reste disponible par email à 
                <a href="mailto:contact@archinbox.fr" style="color:#D85A41; text-decoration:none;">contact@archinbox.fr</a>
              </td>
            </tr>

            <!-- Social Icons -->
            <tr>
              <td align="center" style="padding:10px;">
                <a href="https://archinbox.fr" target="_blank" rel="noopener" style="margin:0 6px;">
                  <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png" alt="Website">
                </a>
                <a href="https://www.instagram.com/archinbox_fr">
                  <img src="https://projet.archinbox.fr/wp-content/uploads/2025/12/Frame-1261153901.png" alt="Instagram" style="height:20px;">
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#D85A41; color:#ffffff; padding:15px 20px; font-size:12px; text-align:center;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left">ARCHINBOX © ${currentYear}</td>
                    <td align="right">
                      <a href="https://archinbox.fr" style="color:#fff; margin:0 8px; text-decoration:none;">Website</a>
                      <a href="https://archinbox.fr/conditions-generales-de-vente" style="color:#fff; margin:0 8px; text-decoration:none;">CGV</a>
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

// Send Payment Email
const sendPaymentEmail = async (existingUser, savedOrder) => {
  try {
    const user = existingUser;
    const order = savedOrder;
    const html = buildPaymentTemplate(order, user);

    await transporter.sendMail({
      from: `"Archinbox" <${process.env.EMAIL_USER}>`,
      to: "contact@archinbox.fr",
      subject: "Nouveau paiement - Archinbox",
      html
    });

    console.log(`📧 Payment email sent for order ${order._id}`);
  } catch (err) {
    console.error("❌ Failed to send payment email:", err.message);
  }
};

// Main
export const onNewPayment = async (existingUser, savedOrder) => {
  await sendPaymentEmail(existingUser, savedOrder)       // ✅ listen for future updates
};
