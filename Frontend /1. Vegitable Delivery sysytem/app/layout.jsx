import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "./StoreProvider";
import CartInitializer from "./CartInitializer";
import AuthInitializer from "./AuthInitializer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "FreshKart. - Shop smarter",
  description: "FreshKart. - Shop smarter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        <StoreProvider>
          <AuthInitializer /> {/* 🔥 THIS WAS MISSING */}
          <CartInitializer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#333",
                color: "#fff",
              },
            }}
          />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
