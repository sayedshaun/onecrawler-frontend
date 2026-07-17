import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/routing/protected-route";
import { PageLoader } from "@/components/shared/page-loader";

// Every page is its own chunk instead of one ~1.25MB bundle everyone downloads
// up front — anonymous visitors hitting the public landing page no longer pay
// for recharts/react-markdown/react-syntax-highlighter, which are only used
// deep in the authenticated dashboard.
const LandingPage = lazy(() => import("@/pages/landing-page"));
const LoginPage = lazy(() => import("@/pages/login-page"));
const SignupPage = lazy(() => import("@/pages/signup-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const NewCrawlPage = lazy(() => import("@/pages/new-crawl-page"));
const CrawlDetailPage = lazy(() => import("@/pages/crawl-detail-page"));
const HistoryPage = lazy(() => import("@/pages/history-page"));
const DataPage = lazy(() => import("@/pages/data-page"));
const TemplatesPage = lazy(() => import("@/pages/templates-page"));
const TutorialPage = lazy(() => import("@/pages/tutorial-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader fullScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <AppShell>
                {/* Nested boundary so switching dashboard pages only swaps the
                    content area — the sidebar/topbar never unmount or flash. */}
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route index element={<DashboardPage />} />
                    <Route path="crawls" element={<HistoryPage />} />
                    <Route path="crawls/new" element={<NewCrawlPage />} />
                    <Route path="crawls/:jobId" element={<CrawlDetailPage />} />
                    <Route path="data" element={<DataPage />} />
                    <Route path="templates" element={<TemplatesPage />} />
                    <Route path="tutorial" element={<TutorialPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Routes>
                </Suspense>
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
