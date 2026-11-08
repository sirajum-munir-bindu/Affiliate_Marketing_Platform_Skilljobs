import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "স্কিলজবস অ্যাফিলিয়েট | বাংলাদেশের বিশ্বস্ত এডুকেশনাল অ্যাফিলিয়েট প্ল্যাটফর্ম",
  description:
    "মানসম্মত কোর্স শেয়ার করুন এবং প্রতি বিক্রয়ে সর্বোচ্চ ৩৫% পর্যন্ত নিশ্চিত কমিশন অর্জন করুন। সহজ bKash পেমেন্ট ও রিয়েল টাইম ট্র্যাকিং।",
  keywords: ["affiliate marketing bangladesh", "online course affiliate", "bKash affiliate income", "skilljobs bd"],
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
  openGraph: {
    title: "স্কিলজবস অ্যাফিলিয়েট প্ল্যাটফর্ম - আপনার পরিচিতির নেটওয়ার্কই হোক আয়ের নতুন সুযোগ",
    description: "মানসম্মত কোর্স মানুষের কাছে পৌঁছে দিন এবং প্রতি বিক্রয়ে সর্বোচ্চ ৩৫% পর্যন্ত নিশ্চিত কমিশন অর্জন করুন।",
    locale: "bn_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" type="image/png" href="/icon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-[#172033] antialiased">
        {children}
      </body>
    </html>
  );
}
