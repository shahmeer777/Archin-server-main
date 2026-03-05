// Email_sent_when_calendlybooked.js

import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

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

// ------------------
// Transporter
// ------------------
// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ------------------
// Build Template
// ------------------
const buildCalendlyTemplate = (order, user, rdvData) => {
  const currentYear = new Date().getFullYear();

  const firstLastName =
    `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim() ||
    user?.userName ||
    "N/A";

  const email = order.billing?.email || user?.userEmail || "N/A";
  const estimatedSurface = order.surface_interieure || "N/A";
  const styleChosen = order.style || "N/A";
  const numberOfPieces = order.espaces?.length || "N/A";
  const piecesToRenovate = order.espaces?.map(e => e.value).join(", ") || "N/A";

  const dateHour =
    rdvData?.resource?.start_time &&
    new Date(rdvData.resource.start_time).toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
    });

  const calendlyLink = rdvData?.resource?.uri || "N/A";
  const googleMeetLink =
    rdvData?.resource?.location?.join_url || "N/A";

 return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>RDV visio réservé - Archinbox (Admin)</title>
</head>
<body>
  <center class="email-wrapper">
    <table class="email-main" width="100%">
      <tr>
        <td class="header" style="background:#D85A41;text-align:center;padding:34px 20px 18px;">
          <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/archinbox-header.png" style="max-height:54px;">
        </td>
      </tr>
      <tr>
        <td class="content" style="padding:30px 34px; font-size:15px; line-height:1.45;">
          <p class="greeting" style="font-weight:700; font-size:20px; text-align:center;">Bonjour Archinbox team,</p>
          <p>Le client <strong>${firstLastName}</strong> a réservé son <strong>RDV visio</strong> après avoir complété le questionnaire.</p>

          <p style="color:#D85A41; font-weight:700; text-decoration:underline;">Détails du rendez-vous :</p>
          <p>• Date & Heure : <strong>${dateHour || "N/A"}</strong></p>
          <p>• Lien visio (Google Meet) :
            <a href="${googleMeetLink}" target="_blank">${googleMeetLink}</a>
          </p>

          <p style="color:#D85A41; font-weight:700; text-decoration:underline;">Infos client :</p>
          <p>• Email : <strong>${email}</strong></p>
          <p>• Surface estimée : <strong>${estimatedSurface} m²</strong></p>
          <p>• Style dominant : <strong>${styleChosen}</strong></p>
          <p>• Nombre de pièces : <strong>${numberOfPieces}</strong></p>
          <p>• Pièce(s) à rénover : <strong>${piecesToRenovate}</strong></p>

          <p style="color:#D85A41; font-weight:700; text-decoration:underline;">Statut :</p>
          <p><strong>RDV programmé : à préparer.</strong></p>

          <hr style="border-top:2px dashed #8a8a8a; margin:22px 0;">
        </td>
      </tr>

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
          <a href="https://projet.archinbox.fr" target="_blank" rel="noopener" style="margin:0 6px;">
            <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png" alt="Website">
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener" style="margin:0 6px;">
            <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-3.png" alt="LinkedIn">
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener" style="margin:0 6px;">
            <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-4.png" alt="Facebook">
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
                <a href="https://projet.archinbox.fr" style="color:#fff; margin:0 8px; text-decoration:none;">Website</a>
                <a href="https://projet.archinbox.fr/conditions-generales-de-vente" style="color:#fff; margin:0 8px; text-decoration:none;">CGV</a>
                <a href="https://projet.archinbox.fr/conditions-generales-dutilisation" style="color:#fff; margin:0 8px; text-decoration:none;">CGU</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;

};

// ------------------
// Send Email
// ------------------
const sendCalendlyEmail = async (order) => {
  try {
    const user = await User.findOne({ userId: order.userId });

    const calUri = order.phase_2?.content?.calendlyEvent?.event?.uri;
    if (!calUri) {
      console.log(`⚠️ No Calendly URI for order ${order._id}`);
      return;
    }

    console.log(`🔎 Found Calendly URI for order ${order._id}: ${calUri}`);

    const response = await fetch(calUri, {
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_BEARER}`,
        Accept: "application/json",
      },
    });

    const raw = await response.text();
    let rdvData = {};
    try {
      rdvData = JSON.parse(raw);
    } catch {
      rdvData = { _raw: raw };
    }

    console.log("📄 Calendly HTTP code:", response.status);
    console.log("📄 Calendly response:", JSON.stringify(rdvData, null, 2));

    const html = buildCalendlyTemplate(order, user, rdvData);

    await transporter.sendMail({
      from: `"Archinbox" <${process.env.EMAIL_USER}>`,
      to: "contact@archinbox.fr",
      subject: "RDV visio réservé - Archinbox",
      html,
    });

    console.log(`📧 Calendly email sent for order ${order._id}`);
    order.calendlyMailSent = true;
    await order.save();
  } catch (err) {
    console.error("❌ Failed to send Calendly email:", err.message);
  }
};

// ------------------
// Initial Catch-up
// ------------------
const checkExistingOrders = async () => {
  const orders = await Order.find({
    "phase_2.content.calendlyEvent.event.uri": { $exists: true, $ne: null },
    calendlyMailSent: { $ne: true },
  });

  if (orders.length) {
    console.log(`🔍 Found ${orders.length} orders with Calendly bookings`);
    for (const order of orders) {
      await sendCalendlyEmail(order);
    }
  } else {
    console.log("ℹ️ No pending Calendly bookings.");
  }
};

// ------------------
// Watch for new updates
// ------------------
const watchOrders = async () => {
  const changeStream = Order.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "update") {
      const updated = change.updateDescription.updatedFields || {};
      if ("phase_2.content.calendlyEvent.event.uri" in updated) {
        const order = await Order.findById(change.documentKey._id);
        if (
          order &&
          order.phase_2?.content?.calendlyEvent?.event?.uri &&
          !order.calendlyMailSent
        ) {
          console.log("📩 Calendly booking detected, sending email...");
          await sendCalendlyEmail(order);
        }
      }
    }
  });

  console.log("👀 Watching orders for future Calendly bookings...");
};

// ------------------
// Main
// ------------------
export const calendlybooked_admin = async () => {
  await connectDB();
  await checkExistingOrders();
  await watchOrders();
};

