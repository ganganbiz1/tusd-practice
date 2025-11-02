import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TUSD - File Upload Manager",
  description: "TUS protocol-based file upload manager with S3/Minio backend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
