import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from '../models/User.js';
import { Order } from "../models/Order.js";

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


// 1️⃣ Transporter config
const transporter = nodemailer.createTransport({
  service: "gmail", // or use host/port if custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const buildTemplate = (order) => {
  const currentYear = new Date().getFullYear();
  const orderDate = order.date
    ? new Date(order.date).toLocaleDateString("fr-FR")
    : "N/A";

  const itemsRows = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="width:72px; padding-right:12px;">
          <img src="${
            item.image ||
            "https://projet.archinbox.fr/wp-content/uploads/2025/09/placeholder.png"
          }" 
               alt="${item.name}" style="width:56px; display:block;">
        </td>
        <td style="font-family:Arial, sans-serif; font-size:14px; color:#333;">
          <div style="font-weight:bold; margin-bottom:2px;">${item.name}</div>
          <div style="font-size:12px; color:#666;">Qté: ${item.quantity}</div>
        </td>
        <td style="text-align:right; font-family:Arial, sans-serif; font-size:14px; font-weight:bold; color:#D85A41;">
          ${item.total} €
        </td>
      </tr>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td align="center" style="padding:20px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

            <!-- Header -->
            <tr>
              <td style="background:#D85A41; padding:20px; border-radius:12px 12px 0 0; text-align:center;">
                <img src="http://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Marron-1.png" alt="ARCHINBOX" style="height:40px; display:block; margin:0 auto;">
              </td>
            </tr>

            <!-- Divider -->
            <tr><td style="border-top:2px solid #eee;"></td></tr>

            <!-- Content -->
            <tr>
              <td style="padding:24px; font-size:14px; color:#333;">
                <p style="margin:0 0 10px 0; font-size:16px;">Bonjour Archinbox team,</p>
                <p style="margin:0 0 15px 0;">Une nouvelle estimation Archinbox a été générée.</p>

                <p style="margin:12px 0 8px; font-size:15px; color:#D85A41; font-weight:bold;">Informations client :</p>
                <p style="margin:0 0 10px;">
                  • Nom : <strong>${order.billing?.first_name || ""} ${
    order.billing?.last_name || ""
  }</strong><br>
                  • Email : <strong>${order.billing?.email || "N/A"}</strong><br>
                  • Date : <strong>${orderDate}</strong>
                </p>

                <p style="margin:12px 0 8px; font-size:15px; color:#D85A41; font-weight:bold;">Données projet :</p>
                <p style="margin:0 0 10px;">
                  • Surface estimée : <strong>${
                    order.surface_interieure || "N/A"
                  } m²</strong><br>
                  • Style dominant : <strong>${
                    order.selected_styles?.[0] || "N/A"
                  }</strong><br>
                  • Nombre de pièces : <strong>${
                    order.nb_pieces || "N/A"
                  }</strong><br>
                  • Pièce(s) à rénover : <strong>${
                    order.espaces?.map((e) => e.value).join(", ") || "N/A"
                  }</strong>
                </p>

                <p style="margin:12px 0 8px; font-size:15px; color:#D85A41; font-weight:bold;">Produits / Prestations :</p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                  ${itemsRows || "<tr><td style='font-size:13px;'>Aucun produit renseigné</td></tr>"}
                </table>

                <p style="margin:0 0 10px;">Statut actuel : <strong>${
                  order.status || "En attente"
                }</strong></p>

                <div style="margin:20px 0; text-align:center;">
                  <a href="https://projet.archinbox.fr" 
                     style="background:#D85A41; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; display:inline-block; font-size:14px;">
                     Accéder au fichier client →
                  </a>
                </div>
              </td>
            </tr>

            <!-- Divider -->
            <tr><td style="border-top:2px solid #eee;"></td></tr>

            <!-- Footer -->
            <tr>
              <td style="padding:12px 24px; font-size:12px; color:#666;">
                <table width="100%">
                  <tr>
                    <td align="left">ARCHINBOX © ${currentYear}</td>
                    <td align="right">
                      <a href="https://projet.archinbox.fr" style="color:#666; text-decoration:none; margin-left:10px;">Website</a>
                      <a href="https://projet.archinbox.fr/conditions-generales-de-vente" style="color:#666; text-decoration:none; margin-left:10px;">CGV</a>
                      <a href="https://projet.archinbox.fr/conditions-generales-dutilisation" style="color:#666; text-decoration:none; margin-left:10px;">CGU</a>
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


// 4️⃣ Send emails
const sendEmails = async (recipients) => {
  for (const recipient of recipients) {
    try {
      const info = await transporter.sendMail({
        from: `"Archinbox" <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: "Votre projet Archinbox n'attend que vous !",
        html: buildTemplate(recipient.firstName)
      });

      console.log(`✅ Email sent to ${recipient.email}: ${info.messageId}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${recipient.email}:`, err.message);
    }
  }
};

// 🔍 Fetch orders where phase_2.content is empty or not set
const getOrdersWithoutPhase2 = async () => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          $or: [
            { "phase_2.content": { $exists: false } },
            { "phase_2.content": { $exists: false } },
            { "phase_2.content": {} },
            { "phase_2.content": null }
          ]
        }
      }, // Here is the all conditions 
      {
        $lookup: {
          from: "users", // 👈 matches Mongo collection name (lowercase plural by default)
          localField: "userId",
          foreignField: "userId",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { orderId: 1, "user.userName": 1, "user.userEmail": 1 } }
    ]);
    console.log(orders)
    const emailList = orders.map(order => ({
      firstName: order.user?.userName || "N/A",
      email: order.user?.userEmail || "N/A",
      orderId: order.orderId || null
    }));

    console.log("📧 Email List:", emailList);
    await sendEmails(emailList);

    return emailList;
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    return [];
  }
};
// Test function
const run = async () => {
  await connectDB();
  await getOrdersWithoutPhase2(); 
  mongoose.disconnect();
};


export const reminder_48hrs = async () => { setInterval(() => {
  run();
}, 48 * 60 * 60 * 1000); // 48 * 60 * 60 * 1000 for 48 hours
}
