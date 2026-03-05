import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LandingPage } from "@/pages/Landing";
import { PricingPage } from "@/pages/Pricing";
import LoginPage from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { ProjectsList } from "./pages/Dashboard/ProjectsList";
import { DashboardHome } from "./pages/Dashboard/DashboardHome";
import { NewProject } from "./pages/Dashboard/NewProject";
import { ProjectDetail } from "./pages/Dashboard/ProjectDetail";
import { ContentAgents } from "./pages/Dashboard/ContentAgents";
import { ContentLibrary } from "./pages/Dashboard/ContentLibrary";
import { VisualStudio } from "./pages/Dashboard/VisualStudio";
import { AutomationEngine } from "./pages/Dashboard/AutomationEngine";
import { Products } from "./pages/Dashboard/Products";
import { Calendar } from "./pages/Dashboard/Calendar";
import { Gallery } from "./pages/Dashboard/Gallery";
import { Billing } from "./pages/Dashboard/Billing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProjectsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/new"
        element={
          <ProtectedRoute>
            <NewProject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId"
        element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId/detail"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId/content"
        element={
          <ProtectedRoute>
            <ContentAgents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId/content-library"
        element={
          <ProtectedRoute>
            <ContentLibrary />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId/visuals"
        element={
          <ProtectedRoute>
            <VisualStudio />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId/automation"
        element={
          <ProtectedRoute>
            <AutomationEngine />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/project/:projectId/gallery"
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/billing"
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
