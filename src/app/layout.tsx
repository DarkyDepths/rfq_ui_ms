import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";

import "./globals.css";

import { appConfig } from "@/config/app";
import { AppShellProvider } from "@/context/app-shell-context";
import { RoleProvider } from "@/context/role-context";

const displayFont = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: appConfig.name,
    template: `%s | ${appConfig.shortName}`,
  },
  description: appConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} min-h-screen bg-background text-foreground`}
      >
        <RoleProvider>
          <AppShellProvider>{children}</AppShellProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
