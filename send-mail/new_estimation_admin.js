// new_estimation_admin.js
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../models/Order.js";
import {User} from "../models/User.js"
dotenv.config();

// 🔌 Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// buildAdminTemplate should stay PURE (sync, no async/await)
const buildAdminTemplate = (order, user) => {
  const currentYear = new Date().getFullYear();
  const orderDate = order.date
    ? new Date(order.date).toLocaleDateString("fr-FR")
    : "N/A";

  // ✅ Prefer billing name if available, fallback to User model
  const fullName =
    `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim() ||
    user?.userName ||
    "N/A";

  const email =
    order.billing?.email ||
    user?.userEmail ||
    "N/A";

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Nouvelle estimation - Archinbox (Admin)</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif; color:#333333;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#D85A41; text-align:center; padding:30px 20px;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/archinbox-header.png" alt="ARCHINBOX" style="max-width:200px; height:auto;">
              </td>
            </tr>

            <tr><td style="height:2px; background:#eaeaea;"></td></tr>

            <!-- Content -->
            <tr>
              <td style="padding:30px 40px;">
                <p style="font-size:18px; font-weight:bold; margin:0 0 16px;">Bonjour Archinbox team,</p>
                <p style="font-size:15px; margin:0 0 12px;">Une nouvelle estimation Archinbox a été générée.</p>
                <p style="font-size:15px; margin:0 0 20px;">Le client a complété son questionnaire, son projet est désormais qualifiable pour un suivi commercial ou une relance.</p>

                <p style="color:#D85A41; font-weight:bold; margin:18px 0 8px; font-size:16px;">Informations client :</p>
                <p style="font-size:14px; margin:0 0 16px; line-height:1.6;">
                  • Nom : <strong>${fullName}</strong><br>
                  • Email : <strong>${email}</strong><br>
                  • Date : <strong>${orderDate}</strong>
                </p>

                <p style="color:#D85A41; font-weight:bold; margin:18px 0 8px; font-size:16px;">Données projet :</p>
                <p style="font-size:14px; margin:0 0 16px; line-height:1.6;">
                  • Surface estimée : <strong>${order.surface_interieure || "N/A"} m²</strong><br>
                  • Style dominant : <strong>${order.selected_styles?.[0] || "N/A"}</strong><br>
                  • Nombre de pièces : <strong>${order.nb_pieces || "N/A"}</strong><br>
                  • Pièce(s) à rénover : <strong>${order.espaces?.map(e => e.value).join(", ") || "N/A"}</strong>
                </p>

                <p style="color:#D85A41; font-weight:bold; margin:18px 0 8px; font-size:16px;">Statut actuel :</p>
                <p style="font-size:14px; margin:0 0 16px;">
                  <strong>${order.status || "En attente"}</strong>
                </p>

                <!-- CTA Button -->
                <div style="text-align:center; margin:30px 0;">
                  <a href="${order.clientFileUrl || '#'}" target="_blank" rel="noopener" 
                     style="display:inline-block; background:#D85A41; color:#fff; text-decoration:none; font-weight:bold; padding:12px 24px; border-radius:6px; font-size:14px;">
                     Accéder au fichier client →
                  </a>
                </div>
              </td>
            </tr>

            <tr><td style="height:2px; background:#eaeaea;"></td></tr>

            <!-- Contact Info -->
            <tr>
              <td style="padding:20px; font-size:13px; color:#555555; text-align:center;">
                Si vous avez des questions, notre équipe reste disponible par email à 
                <a href="mailto:contact@archinbox.fr" style="color:#D85A41; text-decoration:none;">contact@archinbox.fr</a>
              </td>
            </tr>

            <!-- Mascotte -->
            <tr>
              <td align="center" style="padding:15px 0;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png" alt="Mascotte Archinbox" style="max-width:120px; height:auto;">
              </td>
            </tr>

            <!-- Social Icons -->
            <tr>
              <td align="center" style="padding:15px 0;">
                <a href="https://projet.archinbox.fr" target="_blank" rel="noopener" style="margin:0 6px; display:inline-block;">
                  <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png" alt="Website" style="width:24px; height:24px;">
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener" style="margin:0 6px; display:inline-block;">
                  <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-3.png" alt="LinkedIn" style="width:24px; height:24px;">
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener" style="margin:0 6px; display:inline-block;">
                  <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-4.png" alt="Facebook" style="width:24px; height:24px;">
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#D85A41; font-size:12px; color:#666666; padding:10px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="font-size:12px; color:#666666;">
                      ARCHINBOX © ${currentYear}
                    </td>
                    <td align="right" style="font-size:12px; color:#666666;">
                      <a href="https://projet.archinbox.fr" style="color:#D85A41; text-decoration:none; margin-left:10px;">Website</a>
                      <a href="https://projet.archinbox.fr/conditions-generales-de-vente" style="color:#D85A41; text-decoration:none; margin-left:10px;">CGV</a>
                      <a href="https://projet.archinbox.fr/conditions-generales-dutilisation" style="color:#D85A41; text-decoration:none; margin-left:10px;">CGU</a>
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






// Send Email
const sendAdminEmail = async (order) => {
  try {
    // 🔎 Fetch user from User collection by numeric order.userId
    const user = await User.findOne({ userId: order.userId });

    // ✅ Pass order + user into template
    const html = buildAdminTemplate(order, user);

    await transporter.sendMail({
      from: `"Archinbox" <${process.env.EMAIL_USER}>`,
      to: "contact@archinbox.fr",
      subject: "Nouvelle estimation - Archinbox",
      html
    });

    console.log(`📧 Email sent for order ${order._id}`);
    order.adminMailSent = true;
    await order.save();
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
};


// Initial catch-up check (orders already with images_reactions)
const checkExistingOrders = async () => {
  const orders = await Order.find({
    images_reactions: { $exists: true, $ne: [] },
    adminMailSent: { $ne: true }
  });

  if (orders.length) {
    console.log(`🔍 Found ${orders.length} orders with reactions`);
    for (const order of orders) {
      await sendAdminEmail(order);
    }
  } else {
    console.log("ℹ️ No pending orders with reactions.");
  }
};

// Watch for new updates (future reactions)
const watchOrders = async () => {
  const changeStream = Order.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "update") {
      const updated = change.updateDescription.updatedFields || {};
      if ("images_reactions" in updated) {
        const order = await Order.findById(change.documentKey._id);
        if (order && order.images_reactions.length && !order.adminMailSent) {
          console.log("📩 Reaction detected in update, sending email...");
          await sendAdminEmail(order);
        }
      }
    }
  });

  console.log("👀 Watching orders for future image reactions...");
};

// Main
export const estimation_admin = async () => {
  await connectDB();
  await checkExistingOrders(); // ✅ send for already populated reactions
  await watchOrders();         // ✅ listen for future updates
};

// main();
