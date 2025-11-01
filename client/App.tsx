import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Resources from "./pages/Resources";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import StudentProfile from "./pages/StudentProfile";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/teachers" element={<ProtectedRoute roles={["teacher","admin"]}><TeacherDashboard /></ProtectedRoute>} />
              {/* Allow authenticated users to access /students; content will differ by role */}
              <Route path="/students" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/students/:id" element={<ProtectedRoute roles={["teacher","admin"]}><StudentProfile /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute roles={["teacher","admin"]}><Resources /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Reuse existing root to avoid createRoot being called multiple times during HMR
const container = document.getElementById("root")!;
try {
  if ((window as any).__root) {
    console.debug("App: reusing existing root");
    (window as any).__root.render(<App />);
  } else {
    console.debug("App: creating new root");
    const root = createRoot(container);
    (window as any).__root = root;
    root.render(<App />);
  }
} catch (err) {
  console.error("App root render error:", err);
}
