
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccountLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}