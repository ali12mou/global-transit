import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { ContactLayout } from "./layouts/ContactLayout";
import { Home } from "./pages/Home";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminGuard } from "./admin/AdminGuard";
import { AdminModulePage } from "./admin/AdminModulePage";
import { AdminUsersPage } from "./admin/AdminUsersPage";
import { AdminConfigurationPage } from "./admin/AdminConfigurationPage";
import { AdminContactsPage } from "./admin/AdminContactsPage";
import { AdminAboutPage } from "./admin/AdminAboutPage";
import { entityModules } from "./admin/entityModules";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { NewsPage } from "./pages/NewsPage";
import { NewsDetailPage } from "./pages/NewsDetailPage";
import { InfrastructurePage } from "./pages/InfrastructurePage";

export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="a-propos" element={<AboutPage />} />
        <Route path="activites" element={<ActivitiesPage />} />
        <Route path="projets/:slug" element={<ProjectDetailPage />} />
        <Route path="projets" element={<ProjectsPage />} />
        <Route path="infrastructures" element={<InfrastructurePage />} />
        <Route path="clients" element={<Navigate to="/infrastructures" replace />} />
        <Route path="actualites/:slug" element={<NewsDetailPage />} />
        <Route path="actualites" element={<NewsPage />} />
      </Route>
      <Route element={<ContactLayout />}>
        <Route path="contact" element={<ContactPage />} />
      </Route>
      <Route path="admin/login" element={<AdminLogin />} />
      <Route
        path="admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="about" element={<AdminAboutPage />} />
        <Route path="configuration" element={<AdminConfigurationPage />} />
        <Route path="contacts" element={<AdminContactsPage />} />
        {entityModules.map((m) => (
          <Route key={m.route} path={m.route} element={<AdminModulePage module={m} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
