/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextRequest, NextResponse } from "next/server";
import { renderTrpcPanel } from "@metamorph/trpc-panel";
import { appRouter } from "../../../server/api/root";

export function GET(_: NextRequest) {
  const panelHtml = renderTrpcPanel(appRouter, {
    url: "http://localhost:3000/api/trpc",
    transformer: "superjson",
  });

  return new NextResponse(panelHtml, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
