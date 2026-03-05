// phase2_completed_user.js
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

dotenv.config();

// 🔌 MongoDB
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

// 📧 Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📄 Build Phase 2 Completed Template
const buildPhase2Template = (order, user) => {
  const currentYear = new Date().getFullYear();
  const firstName =
    order.billing?.first_name || user?.userName?.split(" ")[0] || "Client";
  const calendlyUrl =
    order.calendlyLink ||
    order.phase_2?.content?.calendlyEvent?.event?.uri ||
    "#";

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre projet Archinbox démarre officiellement 🎉</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td align="center" style="padding:20px 0;">
          <table cellpadding="0" cellspacing="0" border="0" width="600" style="background:#fff; border-radius:4px; overflow:hidden; max-width:600px; width:100%;">
            
            <!-- Header -->
            <tr>
              <td style="background:#fff; padding:20px; text-align:center;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Marron-1.png"
                     alt="ARCHINBOX" style="max-height:45px; height:auto;">
              </td>
            </tr>
            <tr><td style="border-top:1px dashed #ccc; height:0; line-height:0;"></td></tr>
            
            <!-- Content -->
            <tr>
              <td style="padding:20px 30px; font-size:14px; color:#333; line-height:1.6;">
                <p style="font-weight:bold; font-size:20px; text-align:center; color:#333; margin:0 0 20px 0;">Bonjour ${firstName},</p>

                <p style="font-size:16px; margin:20px 0; color:#333;">Merci pour votre réactivité, nous avons bien reçu <span style="color:#D85A41;font-weight:bold;">l'ensemble des éléments nécessaires</span> au démarrage de votre projet.</p>

                <div style="background-color:#f0f8ff; padding:15px 20px; margin:20px 0; border-radius:4px; border-left:4px solid #D85A41;">
                  <p style="margin:0;"><strong>Notre équipe va désormais étudier votre brief avec attention pour vous proposer une <span style="color:#D85A41;">solution 100% adaptée à vos contraintes et vos envies</span>.</strong></p>
                </div>

                <p>Vous serez notifié à chaque avancée dans votre espace personnel.</p>

                <p style="font-weight:bold; color:#D85A41; margin:20px 0; font-size:15px;">Prochaine étape : <span style="color:#D85A41;">un appel avec un membre de l'équipe ArchinBox</span> pour clarifier certains points afin de vous délivrer votre projet à temps.</p>

                <div style="background-color:#fff3f0; padding:15px 20px; margin:20px 0; border-radius:4px; border:1px solid #D85A41;">
                  <p style="margin:0 0 15px 0;"><span style="color:#D85A41;font-weight:bold;">Si vous n'avez pas encore pris RDV</span>, veuillez le faire ici :</p>
                  <div style="text-align:center; margin:25px 0;">
                    <a href="${calendlyUrl}" target="_blank" 
                       style="display:inline-block; background:#D85A41; color:#fff !important; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px;">
                       Prendre RDV avec ArchinBox →
                    </a>
                  </div>
                </div>

                <p style="margin-top:30px;"><strong>À bientôt,</strong></p>
                <p style="color:#D85A41; font-style:italic;">Raphaëlle de ArchinBox</p>
              </td>
            </tr>

            <tr><td style="border-top:1px dashed #ccc; height:0; line-height:0;"></td></tr>

            <!-- Contact -->
            <tr>
              <td style="font-size:13px; text-align:center; color:#666; padding:20px 30px;">
                Si vous avez des questions, notre équipe reste disponible par email à 
                <a href="mailto:contact@archinbox.fr" style="color:#D85A41; text-decoration:none; font-weight:bold;">contact@archinbox.fr</a>
              </td>
            </tr>

            <!-- Mascotte -->
            <tr>
              <td align="center" style="padding:10px 0;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png"
                     alt="Mascotte Archinbox" style="height:120px; display:block; margin:0 auto;">
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#D85A41; color:#fff; font-size:15px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:20px;" align="left">ARCHINBOX © ${currentYear}</td>
                    <td style="padding:20px;" align="right">
                      <a href="https://projet.archinbox.fr" style="color:#fff; text-decoration:none; margin-left:15px;">Website</a>
                      <a href="https://projet.archinbox.fr/conditions-generales-de-vente" style="color:#fff; text-decoration:none; margin-left:15px;">CGV</a>
                      <a href="https://projet.archinbox.fr/conditions-generales-dutilisation" style="color:#fff; text-decoration:none; margin-left:15px;">CGU</a>
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

// 📤 Send Phase 2 Email
const sendPhase2Email = async (order) => {
  try {
    const user = await User.findOne({ userId: order.userId });
    const html = buildPhase2Template(order, user);

    await transporter.sendMail({
      from: `"Archinbox" <${process.env.EMAIL_USER}>`,
      to: user?.email, // ✅ send to user if available 
    to: "contact@archinbox.fr",
    subject: "Votre projet Archinbox démarre officiellement 🎉",
      html,
    });

    console.log(`✅ Phase 2 email successfully sent (order ${order._id})`);
    order.phase2MailSent = true;
    await order.save();
  } catch (err) {
    console.error("❌ Failed to send Phase 2 email:", err.message);
  }
};

// Catch-up check
const checkExistingCalendlyOrders = async () => {
  const orders = await Order.find({
    "phase_2.content.calendlyEvent.event.uri": { $exists: true, $ne: null },
    phase2MailSent: { $ne: true },
  });

  if (orders.length) {
    console.log(`🔍 Found ${orders.length} existing Phase 2 completed orders`);
    for (const order of orders) {
      await sendPhase2Email(order);
    }
  } else {
    console.log("ℹ️ No existing Phase 2 completed orders pending email.");
  }
};

// 👀 Watch for new bookings
const watchCalendly = async () => {
  const changeStream = Order.watch();
  changeStream.on("change", async (change) => {
    if (change.operationType === "update") {
      const updated = change.updateDescription.updatedFields || {};
      if ("phase_2.content.calendlyEvent.event.uri" in updated) {
        const order = await Order.findById(change.documentKey._id);
        const calendlyUri = order?.phase_2?.content?.calendlyEvent?.event?.uri;
        if (calendlyUri && !order.phase2MailSent) {
          console.log("📅 Calendly booking detected, sending Phase 2 email...");
          order.calendlyLink = calendlyUri;
          await order.save();
          await sendPhase2Email(order);
        }
      }
    }
  });
  console.log("👀 Watching orders for Calendly bookings...");
};

// 🚀 Main
export const phase2_completed = async () => {
  await connectDB();
  await checkExistingCalendlyOrders();
  await watchCalendly();
};



