import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "자세히봐 AI",
  description: "Ergonomic Analysis System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
