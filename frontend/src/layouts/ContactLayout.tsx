import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/** Page Contact : en-tête et pied de page du site, fond légèrement bleuté. */
export function ContactLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f8]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
