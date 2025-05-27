import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { email, orderDetails } = await request.json()

    if (!email || !orderDetails) {
      return NextResponse.json({ error: "Email et détails de commande requis" }, { status: 400 })
    }

    // Configuration du transporteur d'email
    // Pour la production, utilisez un service comme SendGrid, Mailgun, etc.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "user@example.com",
        pass: process.env.SMTP_PASSWORD || "password",
      },
    })

    // Formatage des articles pour l'email
    const itemsHtml = orderDetails.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toFixed(2)} €</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toFixed(2)} €</td>
        </tr>
      `,
      )
      .join("")

    // Envoi de l'email
    await transporter.sendMail({
      from: `"SmartFarm Shop" <${process.env.SMTP_USER || "noreply@smartfarmshop.com"}>`,
      to: email,
      subject: `Confirmation de commande #${orderDetails.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
            <h1>Merci pour votre commande!</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Confirmation de commande #${orderDetails.orderNumber}</h2>
            <p>Bonjour ${orderDetails.customer.firstName},</p>
            <p>Nous avons bien reçu votre commande. Voici un récapitulatif :</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Détails de la commande</h3>
              <p><strong>Date :</strong> ${new Date(orderDetails.date).toLocaleDateString("fr-FR")}</p>
              <p><strong>Méthode de paiement :</strong> ${
                orderDetails.payment.method === "card" ? "Carte bancaire" : "Paiement à la livraison"
              }</p>
              
              <h3>Articles commandés</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left;">Produit</th>
                    <th style="padding: 10px; text-align: left;">Quantité</th>
                    <th style="padding: 10px; text-align: left;">Prix unitaire</th>
                    <th style="padding: 10px; text-align: left;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Sous-total:</strong></td>
                    <td style="padding: 10px;">${orderDetails.subtotal.toFixed(2)} €</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Livraison:</strong></td>
                    <td style="padding: 10px;">${orderDetails.shippingCost.toFixed(2)} €</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                    <td style="padding: 10px; font-weight: bold;">${orderDetails.total.toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Adresse de livraison</h3>
              <p>${orderDetails.customer.firstName} ${orderDetails.customer.lastName}<br>
              ${orderDetails.customer.address}<br>
              ${orderDetails.customer.postalCode} ${orderDetails.customer.city}<br>
              ${orderDetails.customer.country}</p>
            </div>
            
            <p>Nous vous informerons par email lorsque votre commande sera expédiée.</p>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:contact@smartfarmshop.com">contact@smartfarmshop.com</a>.</p>
          </div>
          
          <div style="background-color: #333; color: white; padding: 15px; text-align: center;">
            <p>&copy; 2023 SmartFarm Shop. Tous droits réservés.</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 })
  }
}
