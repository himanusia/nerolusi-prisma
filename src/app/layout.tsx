import type { Metadata } from "next";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "./_components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: "Nerolusi",
  description: "Nerolusi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="size-full">
        <SessionProvider>
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NextSSRPlugin
                routerConfig={extractRouterConfig(ourFileRouter)}
              />
              {children}
            </ThemeProvider>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
