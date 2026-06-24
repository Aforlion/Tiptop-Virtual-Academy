import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiptop Academy | Premium Virtual Academy for Ages 3-17",
  description: "An online learning academy specialized for learners aged 3 to 17. Hybrid interactive cohorts and flexible live classroom learning built for parent control and student excitement.",
  keywords: ["online academy", "kids learning", "virtual learning", "3-17 years", "flex classrooms", "stem for kids"],
  authors: [{ name: "Barbara" }],
  openGraph: {
    title: "Tiptop Academy | Hybrid Live Virtual Academy for Kids",
    description: "Child-optimized classrooms, structured courses, and absolute security. Build your child's future today.",
    type: "website",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d0d12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
