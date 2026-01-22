import { Request, Response } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { handlePaymentApproved } from "./checkout";

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

const payment = new Payment(client);

export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    console.log("[MercadoPago Webhook] Recebido:", req.body);

    const { type, data } = req.body;

    // Mercado Pago envia notificações de diferentes tipos
    if (type === "payment") {
      const paymentId = data.id;

      // Buscar detalhes do pagamento
      const paymentData = await payment.get({ id: paymentId });

      console.log("[MercadoPago Webhook] Pagamento:", paymentData);

      // Processar apenas pagamentos aprovados
      if (paymentData.status === "approved") {
        await handlePaymentApproved(paymentData);
      }
    }

    // Sempre retornar 200 para o Mercado Pago saber que recebemos
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[MercadoPago Webhook] Erro:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
