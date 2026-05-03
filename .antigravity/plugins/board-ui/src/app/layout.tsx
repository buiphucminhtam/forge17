import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BoardProvider } from "@/components/BoardProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Forgewright Board",
  description: "Multi-agent task board with real-time sync",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BoardProvider>{children}</BoardProvider>
      </body>
    </html>
  );
}
