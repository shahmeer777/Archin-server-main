// reminder_72hrs_user_if_no_phase2.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
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

// 2️⃣ Template builder (uses your HTML template)
const buildTemplate = (order, user) => {
  const currentYear = new Date().getFullYear();
  const firstName =
    user?.userName?.split(" ")[0] ||
    order.billing?.first_name ||
    "Cher client";

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>On est prêts. Et vous ? 🙂</title>
    <style>
      body { margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif; }
      .main-table { width:600px; background:#fff; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
      .header-section { background:#fff; padding:20px; text-align:center; }
      .logo { max-height:40px; }
      .divider { border-top:2px solid #eee; }
      .content-section { padding:24px; font-size:14px; color:#333; line-height:1.5; }
      .greeting { font-size:18px; font-weight:bold; margin-bottom:12px; }
      .ready-text { font-size:15px; margin:12px 0; }
      .highlight-text { color:#D85A41; font-weight:bold; }
      .cta-container { text-align:center; margin:20px 0; }
      .cta-button { background:#D85A41; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-size:14px; }
      .help-section { margin:18px 0; font-size:13px; }
      .excitement-text { font-size:15px; margin-top:20px; }
      .contact-info { font-size:13px; text-align:center; padding:20px; color:#666; }
      .mascotte { max-height:120px; }
      .social-icons { text-align:center; padding:10px 0; }
      .social-icons img { margin:0 6px; height:20px; }
      .footer-bar { background:#D85A41; color:#fff; padding:15px 20px; font-size:12px; }
      .footer-bar a { color:#fff; margin-left:10px; text-decoration:none; }
    </style>
  </head>
  <body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td align="center" style="padding:20px 0;">
          <table class="main-table" cellpadding="0" cellspacing="0" border="0">
            
            <!-- Header -->
            <tr>
              <td class="header-section">
                <img src="http://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Marron-1.png" 
                     alt="ARCHINBOX" 
                     class="logo">
              </td>
            </tr>

            <tr><td class="divider"></td></tr>

            <!-- Content -->
            <tr>
              <td class="content-section">
                <p class="greeting">Bonjour ${firstName},</p>
                <p class="ready-text">Nous sommes prêts à démarrer la conception de votre projet. Il ne manque plus qu'une chose : <span class="highlight-text">vous</span>.</p>
                <p class="missing-text">Vous avez accès à votre espace personnel, mais nous n'avons pas encore reçu les éléments nécessaires pour que notre équipe lance la phase créative.</p>
                
               <div class="cta-container" style="text-align: center; margin: 20px 0;">
  <a href="https://projet.archinbox.fr/login-screen/"
     style="background-color:#D85A41;
            color:#ffffff !important;
            text-decoration:none !important;
            display:inline-block;
            padding:14px 28px;
            font-size:16px;
            font-weight:bold;
            border-radius:6px;
            font-family:Arial, sans-serif;">
    Finaliser mon projet dès maintenant →
  </a>
</div>

                
                <div class="help-section">
                  <p><strong>Et si vous avez besoin d'aide pour compléter votre dossier, n'hésitez pas à nous contacter !</strong> 
                  Ou écrivez-nous directement par mail sur <a href="mailto:contact@archinbox.fr" class="highlight-text">contact@archinbox.fr</a>.</p>
                </div>
                
                <p class="excitement-text">On a hâte de vous accompagner !</p>
                <p><strong>À bientôt,</strong></p>
                <p style="color:#D85A41; font-style:italic;">Raphaëlle de ArchinBox</p>
              </td>
            </tr>

            <tr><td class="divider"></td></tr>

            <!-- Contact Info -->
            <tr>
              <td class="contact-info">
                <p>Si vous avez des questions, notre équipe reste disponible par email à 
                  <a href="mailto:contact@archinbox.fr">contact@archinbox.fr</a>
                </p>
              </td>
            </tr>

            <!-- Mascotte -->
            <tr>
              <td align="center" style="padding:10px 0;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png" 
                     alt="Mascotte Archinbox" 
                     class="mascotte">
              </td>
            </tr>

            <!-- Social -->
            <tr>
              <td class="social-icons">
                <a href="https://projet.archinbox.fr" target="_blank">
                  <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png" alt="Website">
                </a>
                <a href="https://www.linkedin.com/company/archinbox" target="_blank">
                  <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-3.png" alt="LinkedIn">
                </a>
                <a href="https://www.facebook.com/archinbox" target="_blank">
                  <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-4.png" alt="Facebook">
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" class="footer-bar">
                  <tr>
                    <td class="footer-content" align="left">
                      ARCHINBOX © ${currentYear}
                    </td>
                    <td class="footer-content" align="right">
                      <a href="https://projet.archinbox.fr">Website</a>
                      <a href="https://projet.archinbox.fr/conditions-generales-de-vente">CGV</a>
                      <a href="https://projet.archinbox.fr/conditions-generales-dutilisation">CGU</a>
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
const sendEmails = async (ordersWithUser) => {
  for (const obj of ordersWithUser) {
    try {
      const html = buildTemplate(obj.order, obj.user);
      const info = await transporter.sendMail({
        from: `"Archinbox" <${process.env.EMAIL_USER}>`,
        to: obj.user.userEmail,
        subject: "On est prêts. Et vous ? 🙂",
        html,
      });
      console.log(`✅ Reminder sent to ${obj.user.userEmail} for order ${obj.order._id}: ${info.messageId}`);
      await Order.findByIdAndUpdate(obj.order._id, { reminder72Sent: true }, { new: true });
    } catch (err) {
      console.error(`❌ Failed reminder to ${obj.user?.userEmail || "unknown"}:`, err.message);
    }
  }
};

// 4️⃣ Find orders without phase2.calendly
const getOrdersWithoutCalendly = async () => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          $or: [
            { "phase2": { $exists: false } },
            { "phase2.calendly": { $exists: false } },
            { "phase2.calendly": null },
            { "phase2.calendly": "" },
          ],
          reminder72Sent: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ]);

    console.log(`🔍 Found ${orders.length} orders without phase2.calendly`);
    return orders.map((o) => ({
      order: o,
      user: o.user || {
        userId: null,
        userName: `${o.billing?.first_name || ""} ${o.billing?.last_name || ""}`.trim(),
        userEmail: o.billing?.email || "N/A",
      },
    }));
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    return [];
  }
};

// Main run
const run = async () => {
  if (!db.isReady()) {
    await db.connect();
  }
  
  try {
    const ordersWithUser = await getOrdersWithoutCalendly();
    if (ordersWithUser.length) {
      await sendEmails(ordersWithUser);
    } else {
      console.log("ℹ️ No reminders to send now.");
    }
  } catch (err) {
    console.error("❌ run() error:", err.message);
  }
};

// Export function
export const reminder_72hrs = async () => {
  run();
  setInterval(() => run(), 72 * 60 * 60 * 1000); // ⏱️ replace with real 72h in prod
};