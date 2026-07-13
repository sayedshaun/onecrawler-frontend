import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/routing/protected-route";
import LandingPage from "@/pages/landing-page";
import LoginPage from "@/pages/login-page";
import SignupPage from "@/pages/signup-page";
import DashboardPage from "@/pages/dashboard-page";
import NewCrawlPage from "@/pages/new-crawl-page";
import CrawlDetailPage from "@/pages/crawl-detail-page";
import HistoryPage from "@/pages/history-page";
import DataPage from "@/pages/data-page";
import TemplatesPage from "@/pages/templates-page";
import SettingsPage from "@/pages/settings-page";
import NotFoundPage from "@/pages/not-found-page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="crawls" element={<HistoryPage />} />
                <Route path="crawls/new" element={<NewCrawlPage />} />
                <Route path="crawls/:jobId" element={<CrawlDetailPage />} />
                <Route path="data" element={<DataPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
