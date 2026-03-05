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
const buildGeomtryTemplate = (user) => {
  const currentYear = new Date().getFullYear();
  const firstName = user?.userName?.split(" ")[0] || "Client";;

  return `
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Guide de prise de cotes - Archinbox</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:4px; max-width:600px; width:100%;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:20px;">
              <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Marron-1.png" alt="ARCHINBOX" style="max-height:45px; height:auto; display:block;">
            </td>
          </tr>

          <tr>
            <td style="border-top:1px dashed #ccc; height:0; line-height:0;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:20px 30px; font-size:14px; color:#333333; line-height:1.6;">
              <p style="font-weight:bold; font-size:20px; text-align:center; color:#333333; margin:0 0 20px 0;">Bonjour ${firstName},</p>

              <p>Pour bien avancer sur votre projet, <span style="color:#D85A41; font-weight:bold;">nous aurons besoin des mesures précises de votre espace</span>.</p>

              <p>📐 Vous trouverez <a href="https://projet.archinbox.fr/wp-content/uploads/2025/09/GUIDE-PRISE-DE-COTES-.pdf" style="color:#D85A41; font-weight:bold; text-decoration:none;">ici un guide</a> très simple pour vous aider à prendre les cotes vous-même, étape par étape.</p>

              <p>Pensez également à nous envoyer des photos de chaque pièce pour compléter vos relevés.</p>

              <p>Et bien sûr, nous restons disponibles pour répondre à toutes vos questions : lors de l’appel visio ou par mail à <a href="mailto:contact@archinbox.fr" style="color:#D85A41; font-weight:bold; text-decoration:none;">contact@archinbox.fr</a>.</p>

              <div style="text-align:center; margin:30px 0;">
                <a href="https://projet.archinbox.fr/wp-content/uploads/2025/09/GUIDE-PRISE-DE-COTES-.pdf" style="display:inline-block; background:#D85A41; color:#ffffff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px;">Voir le guide →</a>
              </div>

              <p style="margin-top:30px;"><strong>Merci pour votre implication,</strong></p>
              <p style="color:#D85A41; font-style:italic; margin:0;">L’équipe Archinbox</p>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px dashed #ccc; height:0; line-height:0;"></td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:20px 30px; font-size:13px; text-align:center; color:#666;">
              Si vous avez des questions, notre équipe reste disponible par email à 
              <a href="mailto:contact@archinbox.fr" style="color:#D85A41; font-weight:bold; text-decoration:none;">contact@archinbox.fr</a>
            </td>
          </tr>

          <!-- Mascotte -->
          <tr>
            <td align="center" style="padding:10px 0;">
              <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png" alt="Mascotte Archinbox" style="height:120px; display:block; margin:0 auto;">
            </td>
          </tr>

          <!-- Social -->
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
            <td style="background:#D85A41; color:#fff; font-size:15px; padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left">ARCHINBOX © ${currentYear}</td>
                  <td align="right">
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

// Send Payment Email
const sendGeomtryEmail = async (existingUser) => {
  try {
    const user = existingUser;
    const html = buildGeomtryTemplate(user);

    await transporter.sendMail({
      from: `"Archinbox" <${process.env.EMAIL_USER}>`,
      to: `${user.userEmail}`,
      subject: "Prise de cotes - Votre projet Archinbox",
      html
    });

    console.log(`📧 Payment email sent for order`);
  } catch (err) {
    console.error("❌ Failed to send payment email:", err.message);
  }
};


// Main
export const onGeomtryProduct = async (existingUser) => {
  await sendGeomtryEmail(existingUser) 
};
