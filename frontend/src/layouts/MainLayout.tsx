import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToHash } from "@/components/ScrollToHash";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToHash />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
