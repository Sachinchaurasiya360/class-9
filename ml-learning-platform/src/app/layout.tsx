import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Red Panda Learn - AI Education for Class 8-12",
  description:
    "Learn AI the fun way. Story-driven, gamified, and built for Indian students in Class 8-12. CBSE, ICSE, and State Boards. Not boring lectures. Not heavy coding.",
  icons: "/favicon.svg",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
