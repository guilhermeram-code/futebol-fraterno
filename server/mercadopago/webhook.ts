import { Request, Response } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { handlePaymentApproved } from "./checkout";
import crypto from "crypto";
import { ENV } from "../_core/env";

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

const payment = new Payment(client);

export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    console.log("[MercadoPago Webhook] Recebido:", JSON.stringify(req.body, null, 2));
    
    // Se for ID de teste (123456), retornar sucesso imediatamente
    if (req.body?.data?.id === "123456" || req.body?.data?.id === 123456) {
      console.log("[MercadoPago Webhook] ID de teste detectado, retornando sucesso imediatamente");
      return res.status(200).json({ received: true, test: true });
    }
    
    // Validar assinatura do webhook (se configurada)
    if (ENV.mercadoPagoWebhookSecret) {
      const signature = req.headers["x-signature"] as string;
      const requestId = req.headers["x-request-id"] as string;
      
      if (signature && requestId) {
        // Extrair ts e hash da assinatura
        const parts = signature.split(",");
        let ts = "";
        let hash = "";
        
        parts.forEach(part => {
          const [key, value] = part.split("=");
          if (key && value) {
            const trimmedKey = key.trim();
            const trimmedValue = value.trim();
            if (trimmedKey === "ts") ts = trimmedValue;
            if (trimmedKey === "v1") hash = trimmedValue;
          }
        });
        
        if (ts && hash) {
          // Construir string para validação
          const dataId = req.body?.data?.id || "";
          const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
          
          // Calcular HMAC
          const hmac = crypto
            .createHmac("sha256", ENV.mercadoPagoWebhookSecret)
            .update(manifest)
            .digest("hex");
          
          if (hmac !== hash) {
            console.error("[MercadoPago Webhook] Assinatura inválida!");
            return res.status(401).json({ error: "Invalid signature" });
          }
          
          console.log("[MercadoPago Webhook] Assinatura validada com sucesso!");
        }
      }
    }

    const { type, action, data } = req.body;

    // Mercado Pago pode enviar type: "payment" ou action: "payment.updated"
    const isPaymentNotification = type === "payment" || (action && action.startsWith("payment."));
    
    if (isPaymentNotification) {
      const paymentId = data.id;

      // Validar se paymentId existe
      if (!paymentId) {
        console.error("[MercadoPago Webhook] ERRO: data.id não encontrado!");
        return res.status(200).json({ received: true, error: "Missing payment ID" });
      }

      // Buscar detalhes do pagamento
      let paymentData;
      try {
        paymentData = await payment.get({ id: paymentId });
      } catch (error: any) {
        console.error("[MercadoPago Webhook] Erro ao buscar pagamento:", error.message);
        // Se não conseguir buscar o pagamento, retorna 200 para não ficar recebendo
        return res.status(200).json({ received: true, error: "Payment not found" });
      }

      console.log("[MercadoPago Webhook] Pagamento completo:", JSON.stringify(paymentData, null, 2));

      // Processar apenas pagamentos aprovados
      if (paymentData.status === "approved") {
        console.log("[MercadoPago Webhook] Pagamento aprovado, processando...");
        await handlePaymentApproved(paymentData);
      } else {
        console.log(`[MercadoPago Webhook] Pagamento com status ${paymentData.status}, ignorando`);
      }
    } else {
      console.log(`[MercadoPago Webhook] Tipo/action ignorado: type=${type}, action=${action}`);
    }

    // Sempre retornar 200 para o Mercado Pago saber que recebemos
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[MercadoPago Webhook] Erro:", error);
    // Ainda retorna 200 para não ficar recebendo o mesmo webhook
    res.status(200).json({ error: "Webhook processing failed" });
  }
}
