import { getDb } from "./db";
import { emailQueue, trialSignups } from "../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import {
  sendTrialDay2Email,
  sendTrialDay5Email,
  sendTrialDay7Email,
  sendTrialDay14Email,
} from "./email";

/**
 * Cria registros de emails agendados para um novo trial
 */
export async function scheduleTrialEmails(trialSignupId: number, createdAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const day2 = new Date(createdAt);
  day2.setDate(day2.getDate() + 2);

  const day5 = new Date(createdAt);
  day5.setDate(day5.getDate() + 5);

  const day7 = new Date(createdAt);
  day7.setDate(day7.getDate() + 7);

  const day14 = new Date(createdAt);
  day14.setDate(day14.getDate() + 14);

  await db.insert(emailQueue).values([
    {
      trialSignupId,
      emailType: "day_2",
      scheduledFor: day2,
      status: "pending",
    },
    {
      trialSignupId,
      emailType: "day_5",
      scheduledFor: day5,
      status: "pending",
    },
    {
      trialSignupId,
      emailType: "day_7",
      scheduledFor: day7,
      status: "pending",
    },
    {
      trialSignupId,
      emailType: "day_14",
      scheduledFor: day14,
      status: "pending",
    },
  ]);

  console.log(`[EmailScheduler] ✅ Emails agendados para trial ${trialSignupId}`);
}

/**
 * Processa emails pendentes na fila
 * Deve ser chamado periodicamente (ex: a cada 1 hora via cron)
 */
export async function processEmailQueue() {
  const db = await getDb();
  if (!db) {
    console.error("[EmailScheduler] ❌ Database not initialized");
    return;
  }
  try {
    console.log("[EmailScheduler] 🔄 Processando fila de emails...");

    // Buscar emails pendentes que já passaram da data agendada
    const now = new Date();
    const pendingEmails = await db
      .select()
      .from(emailQueue)
      .where(
        and(
          eq(emailQueue.status, "pending"),
          lte(emailQueue.scheduledFor, now)
        )
      )
      .limit(50); // Processar no máximo 50 por vez

    if (pendingEmails.length === 0) {
      console.log("[EmailScheduler] ℹ️ Nenhum email pendente para processar");
      return;
    }

    console.log(`[EmailScheduler] 📧 Encontrados ${pendingEmails.length} emails para enviar`);

    // Processar cada email
    for (const email of pendingEmails) {
      try {
        // Buscar dados do trial
        const trial = await db
          .select()
          .from(trialSignups)
          .where(eq(trialSignups.id, email.trialSignupId))
          .limit(1);

        if (trial.length === 0) {
          console.error(`[EmailScheduler] ❌ Trial ${email.trialSignupId} não encontrado`);
          await db
            .update(emailQueue)
            .set({ status: "failed", errorMessage: "Trial não encontrado" })
            .where(eq(emailQueue.id, email.id));
          continue;
        }

        const trialData = trial[0];
        const emailData = {
          name: trialData.name,
          email: trialData.email,
          campaignName: trialData.campaignName,
          campaignSlug: trialData.campaignSlug,
          expiresAt: trialData.expiresAt,
        };

        // Enviar email baseado no tipo
        let success = false;
        switch (email.emailType) {
          case "day_2":
            success = await sendTrialDay2Email(emailData);
            break;
          case "day_5":
            success = await sendTrialDay5Email(emailData);
            break;
          case "day_7":
            success = await sendTrialDay7Email(emailData);
            break;
          case "day_14":
            success = await sendTrialDay14Email(emailData);
            break;
        }

        // Atualizar status
        if (success) {
          await db
            .update(emailQueue)
            .set({ status: "sent", sentAt: new Date() })
            .where(eq(emailQueue.id, email.id));
          console.log(`[EmailScheduler] ✅ Email ${email.emailType} enviado para ${trialData.email}`);
        } else {
          await db
            .update(emailQueue)
            .set({ status: "failed", errorMessage: "Erro ao enviar email" })
            .where(eq(emailQueue.id, email.id));
          console.error(`[EmailScheduler] ❌ Falha ao enviar email ${email.emailType} para ${trialData.email}`);
        }
      } catch (error) {
        console.error(`[EmailScheduler] ❌ Erro ao processar email ${email.id}:`, error);
        await db
          .update(emailQueue)
          .set({
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
          })
          .where(eq(emailQueue.id, email.id));
      }
    }

    console.log("[EmailScheduler] ✅ Processamento concluído");
  } catch (error) {
    console.error("[EmailScheduler] ❌ Erro ao processar fila:", error);
  }
}

/**
 * Inicia o scheduler (roda a cada 1 hora)
 */
export function startEmailScheduler() {
  console.log("[EmailScheduler] 🚀 Scheduler iniciado (verifica a cada 1 hora)");

  // Processar imediatamente ao iniciar
  processEmailQueue();

  // Processar a cada 1 hora
  setInterval(() => {
    processEmailQueue();
  }, 60 * 60 * 1000); // 1 hora em milissegundos
}
