import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { User } from '../../models/User.js';
import { Order } from "../../models/Order.js";
import { db } from "../../config/database.js";

dotenv.config();

// 1️⃣ Transporter config
const transporter = nodemailer.createTransport({
  service: "gmail", // or use host/port if custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const buildTemplate = (firstName) => {
  const currentYear = new Date().getFullYear();

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
              <p style="font-weight:bold; font-size:20px; font-family:Arial, sans-serif; text-align:center; color:#333; margin:0 0 20px 0;">
                Bonjour ${firstName},
              </p>
              
              <p style="margin:0 0 15px 0;">
                Nous avons préparé pour vous une première synthèse architecturale, à partir des éléments transmis.
              </p>
              
              <p style="margin:0 0 15px 0;">
                Votre <span style="color:#D85A41; font-weight:bold;">moodboard est prêt, votre estimation aussi.</span>
              </p>
              
              <p style="margin:0 0 15px 0;">
                Il ne reste plus qu'un pas à franchir pour activer votre espace de suivi personnalisé.
              </p>
              
              <div style="font-weight:bold; color:#000; background-color:#fff3f0; padding:10px; border-left:4px solid #D85A41; margin:20px 0;">
                L'accompagnement Archinbox démarre dès validation de votre projet.
              </div>
              
              <p style="margin:0 0 15px 0;">
                🔒 <strong>Paiement 100% sécurisé.</strong>
              </p>
              
              <div style="text-align:center; margin:30px 0;">
                <a href="https://projet.archinbox.fr/login-screen/"
                   style="display:inline-block; background:#D85A41; color:#fff !important; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px;">
                  Poursuivre mon projet →
                </a>
              </div>
              
              <p style="margin-top:30px; margin-bottom:0;"><strong>À bientôt,</strong></p>
              <p style="color:#D85A41; font-style:italic; margin:5px 0 0 0;">Raphaëlle de ArchinBox</p>
              
            </td>
          </tr>
          
          <tr>
            <td style="border-top:1px dashed #ccc; height:0; line-height:0;"></td>
          </tr>
          
          <!-- Contact Info -->
          <tr>
            <td style="font-size:13px; text-align:center; color:#666; padding:20px 30px;">
              Si vous avez des questions, notre équipe reste disponible par email à
              <a href="mailto:contact@archinbox.fr" style="color:#D85A41; text-decoration:none; font-weight:bold;">
                contact@archinbox.fr
              </a>
            </td>
          </tr>
          
          <!-- Mascot -->
          <tr>
            <td align="center" style="padding:10px 0;">
              <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png"
                   alt="Mascotte Archinbox"
                   style="height:120px; display:block; margin:0 auto; border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">
            </td>
          </tr>
          
          <!-- Social Icons -->
          <tr>
            <td style="text-align:center; padding:10px 0;">
              <a href="https://archinbox.fr" target="_blank" style="text-decoration:none; margin:0 5px;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png"
                     alt="Website"
                     style="height:14px; display:inline-block; border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">
              </a>
              <a href="https://www.instagram.com/archinbox_fr" target="_blank" style="text-decoration:none; margin:0 5px;">
                <img src="https://projet.archinbox.fr/wp-content/uploads/2025/12/Frame-1261153901.png"
                     alt="Instagram"
                     style="height:14px; display:inline-block; border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#D85A41; color:#fff; font-size:15px; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                <tr>
                  <td style="padding:20px; text-align:left;">
                    ARCHINBOX © {{currentYear}}
                  </td>
                  <td style="padding:20px; text-align:right;">
                    <a href="https://archinbox.fr" style="color:#fff; text-decoration:none; margin-left:15px;">Website</a>
                    <a href="https://archinbox.fr/conditions-generales-de-vente" style="color:#fff; text-decoration:none; margin-left:15px;">CGV</a>
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
     await Order.findByIdAndUpdate(recipient.orderId, { reminder48Sent: true }, { new: true });
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
            { "phase_2": { $exists: false } },
            { "phase_2.content": { $exists: false } },
            { "phase_2.content.calendlyEvent": { $exists: false } },
            { "phase_2.content.calendlyEvent": null },
          ],
          reminder48Sent: { $ne: true },
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
      email: order.user?.userEmail || order.billing?.email || "N/A",
      orderId: order._id || null
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
  if (!db.isReady()) {
    await db.connect();
  }
  
  try {
    const ordersWithUser = await getOrdersWithoutPhase2();
    if (ordersWithUser.length) {
      await sendEmails(ordersWithUser);
    } else {
      console.log("ℹ️ No reminders to send now.");
    }
  } catch (err) {
    console.error("❌ run() error:", err.message);
  }
};


export const reminder_48hrs = async () => { setInterval(() => {
    run();
  }, 48 * 60 * 60 * 1000); // 48 * 60 * 60 * 1000 for 48 hours
}