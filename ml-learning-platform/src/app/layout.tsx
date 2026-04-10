import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ML Learning Path — From Machines to Machine Learning",
  description:
    "A hands-on interactive journey from 'What is a machine?' all the way to building neural networks and CNNs. No prior knowledge needed.",
  icons: "/favicon.svg",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
