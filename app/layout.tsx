import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import ToastProvider from "@/components/Toast";

export const metadata: Metadata = {
  title: "StudyHub — Study smarter. Get more done.",
  description:
    "AI study tools, PDF utilities, image tools, calculators, planners, and everything students need — all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-50 text-ink-900 antialiased">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
