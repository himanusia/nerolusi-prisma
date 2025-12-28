// src/app/api/webhooks/doku/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headers = req.headers;

  const signatureFromHeader = headers.get("signature");
  const clientId = headers.get("client-id");
  const requestId = headers.get("request-id");
  const timestamp = headers.get("request-timestamp");
  const target = "/api/webhooks/doku";

  const digest = crypto
    .createHash("sha256")
    .update(rawBody)
    .digest("base64");

  const signaturePayload =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${target}\n` +
    `Digest:${digest}`;

  const calculatedSignature = crypto
    .createHmac("sha256", process.env.DOKU_SECRET_KEY!)
    .update(signaturePayload)
    .digest("base64");

  const expectedSignature = `HMACSHA256=${calculatedSignature}`;

  if (expectedSignature !== signatureFromHeader) {
    return NextResponse.json({ message: "Invalid Signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  console.log("Valid Signature. Processing:", body.order.invoice_number);

  if (body.transaction.status === "SUCCESS") {
    await db.$transaction(async (tx) => {
      const trx = await tx.payment.update({
        where: { invoiceNumber: body.order.invoice_number },
        data: { status: "SUCCESS" },
      });

      if (trx.type === "token") {
        await tx.user.update({
          where: { id: trx.userId },
          data: { token: { increment: trx.tokens } },
        });
      } else if (trx.type === "tka") {
        await tx.user.update({
          where: { id: trx.userId },
          data: { enrolledTka: true },
        });
      } else if (trx.type === "utbk") {
        await tx.user.update({
          where: { id: trx.userId },
          data: { enrolledUtbk: true },
        });
      } else {
        return NextResponse.json(
          { message: "Unknown transaction type" },
          { status: 400 },
        );
      }
    });
  }

  return NextResponse.json({ message: "OK" });
}
