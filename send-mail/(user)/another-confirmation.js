// phase2_completed_user.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { User } from "../../models/User.js";

dotenv.config();

// 📧 Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📄 Build Phase 2 Completed Template
const confirmationTemplate = (order) => {
  const currentYear = new Date().getFullYear();
  const firstName =  order?.billing?.first_name || "Client";
    const selectedRooms =
    order?.espaces?.map(e => `${e.value} (${e.nb_pieces})`).join(", ") || "—";

  const surfaceType = `Intérieure ${order?.surface_interieure || "—"} m² / Extérieure ${order?.surface_exterieure || "—"} m²`;

  const objectifs = order?.objectifs?.join(", ") || "—";

  const interiorSurface = order?.surface_interieure || "—";
  const exteriorSurface = order?.surface_exterieure || "—";
  const numberOfPieces = order?.nb_pieces || "—";

  const ambiance = order?.selected_styles?.join(", ") || "—";
  const proposalCount = order?.items?.length || 0;
  const materials = order?.selected_subjects?.join(", ") || "—";

  return `
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de commande - Archinbox</title>
</head>

<body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
            <td align="center" style="padding:20px 0;">
                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="background:#ffffff; border-radius:8px; overflow:hidden;">
                    <!-- Header -->
                    <tr>
                        <td style=" text-align:center; padding:30px 20px;">
                            <img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Logo_Typo_Marron-1.png"
                                alt="ARCHINBOX" style="max-height:45px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 3px dashed #161616; background:#eaeaea;"></td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding:30px 40px; font-size:14px; line-height:1.6;">
                            <p style="font-size:18px; font-weight:bold; margin:0 0 16px; color:#161616;display: flex;

    justify-content: center;">Bonjour ${firstName},</p>

                         <p style="margin:0 0 12px; color:#161616;">
    <a href="#" style="color:#161616; text-decoration:none;">
        Merci, votre commande est
        <span style="color:#D85A41; text-decoration:underline;">bien confirmée</span>.
    </a>
</p>

                            <p style="margin:0 0 20px; color:#161616;">
                                Pour vous éviter toute perte d'information, voici le récapitulatif de votre projet
                                Archinbox, tel que vous l'avez configuré lors de votre commande.
                            </p>

                            <p style="color:#000000; font-weight:bold; margin:18px 0 8px; font-size:16px;">Votre projet
                                :</p>
                            <p style="margin:0 0 16px; color:#161616;">
                                • Pièces sélectionnées : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">${selectedRooms}</a><br>
                                • Type de surface de la pièce : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">${surfaceType}</a><br>
                                • Objectifs : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">${objectifs}</a>
                            </p>

                            <p style="color:#000000; font-weight:bold; margin:18px 0 8px; font-size:16px;">Votre bien :
                            </p>
                            <p style="margin:0 0 16px; color:#161616;">
                                • Type de bien : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">${order?.type_bien || "—"}</a><br>
                                • Surface intérieure m² : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">${interiorSurface}</a><br>
                                • Nombre de pièces : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">${numberOfPieces}</a><br>
                                • Surface extérieure m² : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">
${exteriorSurface}</a><br>
                                • Ambiance choisie : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">
${ambiance}</a><br>
                                • Nombre de propositions : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">
${proposalCount}</a><br>
                                • Matériaux favoris : <a href="#"
                                    style="color:#D85A41; text-decoration:none;">
${materials}</a>
                            </p>

<p style="color:#000000; font-weight:bold; margin:18px 0 8px; font-size:16px;">
Prochaine étape :
</p>

<p style="margin:0 0 20px; color:#161616;">
Complétez votre projet dans votre espace personnel pour que notre équipe puisse démarrer
la conception.
</p>

<div style="text-align:center; margin:30px 0;">
<a href="https://projet.archinbox.fr/mode-de-vie/photos"
style="display:inline-block; background:#D85A41; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:16px;">
Compléter mon projet →
</a>
</div>

<p style="margin:0 0 12px; color:#161616;">
Et si vous avez besoin d'aide pour compléter votre dossier, n'hésitez pas à nous
contacter, ou à nous écrire directement par mail sur
<a href="mailto:contact@archinbox.fr"
style="color:#D85A41; text-decoration:none;">
<i>contact@archinbox.fr</i>
</a>
</p>

<p style="margin:0 0 12px; color:#161616;">On a hâte de vous accompagner !</p>
<p style="margin:0 0 12px; color:#161616;">À bientôt,</p>

<p style="color:#D85A41; margin:0; font-style:italic;">
Raphaëlle de <strong>Archinbox</strong>
</p>
</td>
</tr>

<tr>
<td style="height:2px; background:#eaeaea;"></td>
</tr>

<!-- Mascotte -->
<tr>
<td align="center" style="padding:15px 0;">
<img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Archinbox_Mascotte_250605-1.png"
alt="Mascotte Archinbox" style="max-height:120px;">
</td>
</tr>

<!-- Social Icons -->
<tr>
<td align="center" style="padding:10px;">
<a href="https://archinbox.fr" target="_blank" rel="noopener" style="margin:0 6px;">
<img src="https://projet.archinbox.fr/wp-content/uploads/2025/09/Vector-2.png"
alt="Website" style="height:20px;">
</a>
<a href="https://www.instagram.com/archinbox_fr" target="_blank" rel="noopener"
style="margin:0 6px;">
<img src="https://projet.archinbox.fr/wp-content/uploads/2025/12/Frame-1261153901.png"
alt="Instagram" style="height:20px;">
</a>
</td>
</tr>
<tr>
<td align="center" style="padding-top:5px; padding-bottom:5px;">
<a href="mailto:contact@archinbox.fr"
style="color:#161616; text-decoration:none; font-size:14px;">
contact@archinbox.fr
</a>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#D85A41; color:#ffffff; padding:15px 20px; font-size:12px; text-align:center;">
<table width="100%">
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

// 📤 Send Phase 2 Email
export const sendconfirmationEmail = async (order) => {

  try {

    const html = confirmationTemplate(order);

    await transporter.sendMail({
      from: `"Archinbox" <${process.env.EMAIL_USER}>`,
      to: order.billing.email,
      subject: "Récapitulatif de votre projet Archinbox",
      html,
    });

    console.log(`✅ Phase 1 confirmation email sent `);
    return { success: true };
  } catch (err) {
    console.error("❌ Failed to send Phase 2 email:", err.message);
    return { success: false, error: err.message };
  }
};

