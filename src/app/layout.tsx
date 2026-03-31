import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { ThemeProvider } from "next-themes";
import ScrollToTop from '@/components/ScrollToTop';
import Chatbot from '@/components/Chatbot';
import Aoscompo from "@/utils/aos";
import NextTopLoader from 'nextjs-toploader';
import SessionProviderComp from "@/components/nextauth/SessionProvider";
import { AuthDialogProvider } from "./context/AuthDialogContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Haizom Studio",
    template: "%s | Haizom Studio",
  },
  description: "Delivering innovative, reliable engineering solutions—from concept to execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <NextTopLoader />
      <AuthDialogProvider>
      <SessionProviderComp>
        <ThemeProvider
          attribute="class"
          enableSystem={true}
          defaultTheme="system"
        >
          <Aoscompo>
            <Header />
            {children}
            <Footer />
          </Aoscompo>
          <ScrollToTop />
          <Chatbot />
        </ThemeProvider>
        </SessionProviderComp>
        </AuthDialogProvider>
      </body>
    </html>
  );
}
