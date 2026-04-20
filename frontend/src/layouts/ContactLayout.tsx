import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";

/** Page Contact : en-tête site sans le footer global (bandeau bas dédié sur la page). */
export function ContactLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f8]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
