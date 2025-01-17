import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "POLYCOMM",
  description: "Video calling App",
  icons: {
    icon: "/icons/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <ClerkProvider
        appearance={{
          layout: {
            socialButtonsVariant: "iconButton",
            logoImageUrl: "/icons/yoom-logo.svg",
          },
          variables: {
            colorText: "#1E293B",
            colorPrimary: "#4F46E5",
            colorBackground: "#F8FAFC",
            colorInputBackground: "#F1F5F9",
            colorInputText: "#1E293B",
          },
        }}
      >
        <body className={`${inter.className} page bg-slate-50 bg-grid-pattern bg-[size:20px_20px]`}>
          <Toaster />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
