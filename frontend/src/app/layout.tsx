import "@/src/ui/style/app.scss";
import "@/src/ui/style/globals.css";
import {
  Hanken_Grotesk,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import { ToastContainer } from "react-toastify";
import ToastCloseButton from "../ui/components/toast/ToastCloseButton";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata = {
  title: "Wedding Management Portal",
  description: "Fullstack Project",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastContainer
          draggable={true}
          limit={5}
          position="bottom-center"
          newestOnTop
          theme="dark"
          hideProgressBar
          closeButton={ToastCloseButton}
          aria-label="Notifications"
        />
      </body>
    </html>
  );
}
