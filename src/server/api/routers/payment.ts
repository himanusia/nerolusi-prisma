import { z } from "zod";
import { createTRPCRouter, userProcedure } from "~/server/api/trpc";
import crypto from "crypto";
import { env } from "~/env";

export const paymentRouter = createTRPCRouter({
  createCheckout: userProcedure
    .input(
      z.object({
        idempotencyKey: z.string(),
        amount: z.number(),
        userId: z.string(),
        type: z.enum(["token", "tka", "utbk"]),
        tokens: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      if (input.type === "tka" && user.enrolledTka) {
        throw new Error("User sudah terdaftar dalam paket TKA");
      }

      if (input.type === "utbk" && user.enrolledUtbk) {
        throw new Error("User sudah terdaftar dalam paket UTBK");
      }

      // Create record in DB
      const payment = await ctx.db.payment.upsert({
        where: { id: input.idempotencyKey },
        update: {},
        create: {
          id: input.idempotencyKey,
          amount: input.amount,
          userId: input.userId,
          type: input.type,
          tokens: input.tokens ?? 0,
          invoiceNumber: `INV-${input.idempotencyKey}`,
        },
      });

      if (payment.status !== "PENDING") {
        throw new Error("Payment has already been processed.");
      }

      const body = {
        order: {
          amount: input.amount,
          invoice_number: payment.invoiceNumber,
          callback_url: `${env.AUTH_URL}/payments/verify?invoice=${payment.invoiceNumber}`,
        },
        payment: { payment_due_date: 60 },
      };

      // Generate DOKU Signature
      const timestamp = new Date().toISOString().split(".")[0] + "Z";
      const requestId = payment.id;

      const payload = JSON.stringify(body);
      const digest = crypto
        .createHash("sha256")
        .update(payload)
        .digest("base64");

      const signatureString =
        `Client-Id:${env.DOKU_CLIENT_ID}\n` +
        `Request-Id:${requestId}\n` +
        `Request-Timestamp:${timestamp}\n` +
        `Request-Target:/checkout/v1/payment\n` +
        `Digest:${digest}`;

      const signature = crypto
        .createHmac("sha256", env.DOKU_SECRET_KEY!)
        .update(signatureString)
        .digest("base64");

      console.log("--- DEBUG SIGNATURE ---");
      console.log("Secret Key Length:", env.DOKU_SECRET_KEY?.length); // Check if length matches what you expect (detects hidden spaces)
      console.log("Signature String Plain:", JSON.stringify(signatureString)); // JSON.stringify reveals \n characters
      console.log("Generated Signature:", signature);
      console.log("-----------------------");
      // Hit DOKU API
      const response = await fetch(`${env.DOKU_API_URL}/checkout/v1/payment`, {
        method: "POST",
        headers: {
          "Client-Id": env.DOKU_CLIENT_ID!,
          "Request-Id": requestId,
          "Request-Timestamp": timestamp,
          Signature: `HMACSHA256=${signature}`,
          "Content-Type": "application/json",
        },
        body: payload,
      });

      const data = await response.json();

      console.log("DOKU Response:", data);

      if (!response.ok) {
        throw new Error(
          `DOKU API Error: ${data.error_message || "Unknown error"}`,
        );
      }

      if (
        !data.response ||
        !data.response.payment ||
        !data.response.payment.url
      ) {
        throw new Error("Invalid response from DOKU API: missing payment URL");
      }

      return data.response.payment.url; // This is the DOKU hosted page URL
    }),

  getOrderByInvoice: userProcedure
    .input(
      z.object({
        invoice: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({
        where: { invoiceNumber: input.invoice },
      });
      if (!payment) {
        throw new Error("Order not found");
      }
      return payment;
    }),
});
