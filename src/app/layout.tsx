import "@/styles/globals.css";
import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "VendorFlow",
  description: "Multiple Vendor Management System",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <TRPCReactProvider>
  <TooltipProvider>
    {children}
    <Toaster richColors position="top-right" />
  </TooltipProvider>
</TRPCReactProvider>
      </body>
    </html>
  );
}